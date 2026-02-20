use std::str::FromStr;

use anchor_lang::prelude::*;

use crate::constants::{BID_SEED, DEVNET_ASIA_ER_VALIDATOR};
use crate::contexts::*;
use crate::errors::AuctionError;
use crate::events::*;
use crate::state::BidStatus;
use crate::utils::transfer_from_vault;
use ephemeral_rollups_sdk::cpi::DelegateConfig;

/// Creates a new auction instance and initializes auction metadata.
pub fn create_auction_handler(
    ctx: Context<CreateAuction>,
    auction_id: u64,
    min_bid: u64,
    min_increment: u64,
    duration: i64,
) -> Result<()> {
    require!(duration > 0, AuctionError::InvalidDuration);
    require!(min_bid > 0, AuctionError::InvalidMinBid);

    let now = Clock::get()?.unix_timestamp;
    let auction = &mut ctx.accounts.auction_house;
    auction.authority = ctx.accounts.authority.key();
    auction.auction_id = auction_id;
    auction.min_bid = min_bid;
    auction.min_increment = min_increment;
    auction.highest_bid = 0;
    auction.winner = Pubkey::default();
    auction.end_time = now + duration;
    auction.bidder_count = 0;
    auction.committed_count = 0;
    auction.settled_count = 0;
    auction.finalized = false;
    auction.proceeds_claimed = false;
    auction.bump = ctx.bumps.auction_house;
    auction.vault_bump = ctx.bumps.vault;

    emit!(AuctionCreated {
        auction: auction.key(),
        authority: auction.authority,
        auction_id,
        min_bid,
        min_increment,
        ends_at: auction.end_time,
    });

    Ok(())
}

/// Initializes sealed bid account for a bidder and links it to auction.
pub fn initialize_sealed_bid_handler(ctx: Context<InitializeSealedBid>) -> Result<()> {
    let sealed_bid = &mut ctx.accounts.sealed_bid;
    sealed_bid.auction = ctx.accounts.auction_house.key();
    sealed_bid.bidder = ctx.accounts.bidder.key();
    sealed_bid.amount = 0;
    sealed_bid.deposited = 0;
    sealed_bid.status = BidStatus::Ready;
    sealed_bid.committed = false;
    sealed_bid.settled = false;
    sealed_bid.refund_claimed = false;
    sealed_bid.bump = ctx.bumps.sealed_bid;

    let auction = &mut ctx.accounts.auction_house;
    auction.bidder_count = auction
        .bidder_count
        .checked_add(1)
        .ok_or(AuctionError::MathOverflow)?;

    Ok(())
}

/// Delegates the bidder's sealed bid account into the PER execution domain.
pub fn delegate_bid_handler(ctx: Context<DelegateBid>) -> Result<()> {
    let bidder_key = ctx.accounts.bidder.key();
    let seeds: &[&[u8]] = &[
        BID_SEED,
        ctx.accounts.sealed_bid.auction.as_ref(),
        bidder_key.as_ref(),
    ];

    ctx.accounts.delegate_sealed_bid(
        &ctx.accounts.bidder,
        seeds,
        DelegateConfig {
            validator: Pubkey::from_str(DEVNET_ASIA_ER_VALIDATOR).ok(),
            ..Default::default()
        },
    )?;

    ctx.accounts.sealed_bid.status = BidStatus::Active;
    Ok(())
}

/// Submits/updates a bid amount and escrows additional lamports if needed.
pub fn submit_sealed_bid_handler(ctx: Context<SubmitSealedBid>, amount: u64) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let auction = &ctx.accounts.auction_house;
    require!(now < auction.end_time, AuctionError::AuctionEnded);
    require!(!auction.finalized, AuctionError::AuctionFinalized);
    require!(amount >= auction.min_bid, AuctionError::BidBelowMinimum);

    let sealed_bid = &mut ctx.accounts.sealed_bid;
    require!(
        sealed_bid.status == BidStatus::Active,
        AuctionError::AccountNotDelegated
    );

    if sealed_bid.amount > 0 {
        let required_min = sealed_bid
            .amount
            .checked_add(auction.min_increment)
            .ok_or(AuctionError::MathOverflow)?;
        require!(amount >= required_min, AuctionError::BidIncrementTooSmall);
    }

    if amount > sealed_bid.deposited {
        let delta = amount
            .checked_sub(sealed_bid.deposited)
            .ok_or(AuctionError::MathOverflow)?;
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.bidder.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            delta,
        )?;
        sealed_bid.deposited = amount;
    }

    sealed_bid.amount = amount;

    emit!(BidSubmitted {
        auction: auction.key(),
        bidder: sealed_bid.bidder,
        amount,
    });

    Ok(())
}

/// Marks a delegated bid as committed after private execution finishes.
pub fn commit_bid_handler(ctx: Context<CommitBid>) -> Result<()> {
    let auction = &mut ctx.accounts.auction_house;
    require!(
        ctx.accounts.sealed_bid.status == BidStatus::Active,
        AuctionError::AccountNotDelegated
    );
    require!(
        ctx.accounts.sealed_bid.amount >= auction.min_bid,
        AuctionError::BidBelowMinimum
    );

    let sealed_bid = &mut ctx.accounts.sealed_bid;
    sealed_bid.status = BidStatus::Committed;

    if !sealed_bid.committed {
        sealed_bid.committed = true;
        auction.committed_count = auction
            .committed_count
            .checked_add(1)
            .ok_or(AuctionError::MathOverflow)?;
    }

    emit!(BidCommitted {
        auction: auction.key(),
        bidder: sealed_bid.bidder,
        amount: sealed_bid.amount,
    });

    Ok(())
}

/// Settles one committed bid into global winner/highest-bid state.
pub fn settle_committed_bid_handler(ctx: Context<SettleCommittedBid>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let auction = &mut ctx.accounts.auction_house;
    require!(now >= auction.end_time, AuctionError::AuctionActive);
    require!(!auction.finalized, AuctionError::AuctionFinalized);

    let sealed_bid = &mut ctx.accounts.sealed_bid;
    require!(
        sealed_bid.status == BidStatus::Committed && sealed_bid.committed,
        AuctionError::BidNotCommitted
    );
    require!(!sealed_bid.settled, AuctionError::BidAlreadySettled);

    if sealed_bid.amount > auction.highest_bid {
        auction.highest_bid = sealed_bid.amount;
        auction.winner = sealed_bid.bidder;
    }

    sealed_bid.settled = true;
    auction.settled_count = auction
        .settled_count
        .checked_add(1)
        .ok_or(AuctionError::MathOverflow)?;

    emit!(BidSettled {
        auction: auction.key(),
        bidder: sealed_bid.bidder,
        amount: sealed_bid.amount,
        current_highest_bid: auction.highest_bid,
        current_winner: auction.winner,
    });

    Ok(())
}

/// Locks final winner once all committed bids have been settled.
pub fn finalize_auction_handler(ctx: Context<FinalizeAuction>) -> Result<()> {
    let auction = &mut ctx.accounts.auction_house;
    require!(
        Clock::get()?.unix_timestamp >= auction.end_time,
        AuctionError::AuctionActive
    );
    require!(!auction.finalized, AuctionError::AuctionFinalized);
    require!(
        auction.settled_count == auction.committed_count,
        AuctionError::UnsettledCommittedBids
    );

    auction.finalized = true;

    emit!(AuctionFinalized {
        auction: auction.key(),
        winner: auction.winner,
        final_bid: auction.highest_bid,
    });

    Ok(())
}

/// Allows seller to withdraw winning proceeds from the escrow vault.
pub fn claim_seller_proceeds_handler(ctx: Context<ClaimSellerProceeds>) -> Result<()> {
    let auction = &mut ctx.accounts.auction_house;
    require!(auction.finalized, AuctionError::AuctionNotFinalized);
    require!(
        !auction.proceeds_claimed,
        AuctionError::ProceedsAlreadyClaimed
    );
    require!(auction.highest_bid > 0, AuctionError::NoWinningBid);

    transfer_from_vault(
        &ctx.accounts.vault.to_account_info(),
        &ctx.accounts.authority.to_account_info(),
        auction.highest_bid,
    )?;

    auction.proceeds_claimed = true;

    emit!(SellerProceedsClaimed {
        auction: auction.key(),
        authority: auction.authority,
        amount: auction.highest_bid,
    });

    Ok(())
}

/// Allows losing bidders to reclaim their escrow deposits.
pub fn claim_refund_handler(ctx: Context<ClaimRefund>) -> Result<()> {
    let auction = &ctx.accounts.auction_house;
    require!(auction.finalized, AuctionError::AuctionNotFinalized);

    let sealed_bid = &mut ctx.accounts.sealed_bid;
    require!(
        sealed_bid.bidder != auction.winner,
        AuctionError::WinnerNoRefund
    );
    require!(
        !sealed_bid.refund_claimed,
        AuctionError::RefundAlreadyClaimed
    );
    require!(sealed_bid.deposited > 0, AuctionError::NoRefundAvailable);

    let refund_amount = sealed_bid.deposited;
    sealed_bid.refund_claimed = true;

    transfer_from_vault(
        &ctx.accounts.vault.to_account_info(),
        &ctx.accounts.bidder.to_account_info(),
        refund_amount,
    )?;

    emit!(RefundClaimed {
        auction: auction.key(),
        bidder: sealed_bid.bidder,
        amount: refund_amount,
    });

    Ok(())
}

/// Closes a settled bid account; constraints enforce close safety.
pub fn close_sealed_bid_handler(_ctx: Context<CloseSealedBid>) -> Result<()> {
    Ok(())
}
