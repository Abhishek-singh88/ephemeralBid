use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::{commit, delegate};

use crate::constants::{AUCTION_SEED, BID_SEED, VAULT_SEED};
use crate::errors::AuctionError;
use crate::state::{AuctionHouse, BidStatus, SealedBid};

/// Initializes a new auction and its escrow vault PDA.
#[derive(Accounts)]
#[instruction(auction_id: u64)]
pub struct CreateAuction<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + AuctionHouse::LEN,
        seeds = [AUCTION_SEED, authority.key().as_ref(), &auction_id.to_le_bytes()],
        bump
    )]
    pub auction_house: Account<'info, AuctionHouse>,
    #[account(
        init,
        payer = authority,
        space = 0,
        seeds = [VAULT_SEED, auction_house.key().as_ref()],
        bump
    )]
    /// CHECK: Program-owned lamport vault PDA.
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Creates bidder-specific sealed bid account for an auction.
#[derive(Accounts)]
pub struct InitializeSealedBid<'info> {
    #[account(mut)]
    pub auction_house: Account<'info, AuctionHouse>,
    #[account(
        init,
        payer = bidder,
        space = 8 + SealedBid::LEN,
        seeds = [BID_SEED, auction_house.key().as_ref(), bidder.key().as_ref()],
        bump
    )]
    pub sealed_bid: Account<'info, SealedBid>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Delegates sealed bid account to ER/PER.
#[delegate]
#[derive(Accounts)]
pub struct DelegateBid<'info> {
    #[account(
        mut,
        has_one = bidder,
        constraint = sealed_bid.status == BidStatus::Ready @ AuctionError::CannotDelegate,
        del
    )]
    pub sealed_bid: Account<'info, SealedBid>,
    #[account(mut)]
    pub bidder: Signer<'info>,
}

/// Submits/updates a private sealed bid and tops up escrow deposit.
#[derive(Accounts)]
pub struct SubmitSealedBid<'info> {
    #[account(mut)]
    pub auction_house: Account<'info, AuctionHouse>,
    #[account(
        mut,
        has_one = bidder,
        constraint = sealed_bid.auction == auction_house.key() @ AuctionError::BidAuctionMismatch,
        seeds = [BID_SEED, auction_house.key().as_ref(), bidder.key().as_ref()],
        bump = sealed_bid.bump
    )]
    pub sealed_bid: Account<'info, SealedBid>,
    #[account(
        mut,
        seeds = [VAULT_SEED, auction_house.key().as_ref()],
        bump = auction_house.vault_bump
    )]
    /// CHECK: Vault PDA validated by seeds + bump.
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Marks delegated bid as committed after private phase.
#[commit]
#[derive(Accounts)]
pub struct CommitBid<'info> {
    #[account(mut)]
    pub auction_house: Account<'info, AuctionHouse>,
    #[account(
        mut,
        has_one = bidder,
        constraint = sealed_bid.auction == auction_house.key() @ AuctionError::BidAuctionMismatch,
        seeds = [BID_SEED, auction_house.key().as_ref(), bidder.key().as_ref()],
        bump = sealed_bid.bump
    )]
    pub sealed_bid: Account<'info, SealedBid>,
    pub bidder: Signer<'info>,
}

/// Processes one committed bid into winner/highest-bid state.
#[derive(Accounts)]
pub struct SettleCommittedBid<'info> {
    #[account(mut)]
    pub auction_house: Account<'info, AuctionHouse>,
    #[account(
        mut,
        constraint = sealed_bid.auction == auction_house.key() @ AuctionError::BidAuctionMismatch
    )]
    pub sealed_bid: Account<'info, SealedBid>,
}

/// Finalizes auction once all committed bids are settled.
#[derive(Accounts)]
pub struct FinalizeAuction<'info> {
    #[account(
        mut,
        has_one = authority,
        seeds = [
            AUCTION_SEED,
            authority.key().as_ref(),
            &auction_house.auction_id.to_le_bytes()
        ],
        bump = auction_house.bump
    )]
    pub auction_house: Account<'info, AuctionHouse>,
    pub authority: Signer<'info>,
}

/// Transfers winning proceeds to auction authority.
#[derive(Accounts)]
pub struct ClaimSellerProceeds<'info> {
    #[account(
        mut,
        has_one = authority,
        seeds = [
            AUCTION_SEED,
            authority.key().as_ref(),
            &auction_house.auction_id.to_le_bytes()
        ],
        bump = auction_house.bump
    )]
    pub auction_house: Account<'info, AuctionHouse>,
    #[account(
        mut,
        seeds = [VAULT_SEED, auction_house.key().as_ref()],
        bump = auction_house.vault_bump
    )]
    /// CHECK: Vault PDA validated by seeds + bump.
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

/// Allows non-winning bidder to withdraw escrowed funds.
#[derive(Accounts)]
pub struct ClaimRefund<'info> {
    pub auction_house: Account<'info, AuctionHouse>,
    #[account(
        mut,
        has_one = bidder,
        constraint = sealed_bid.auction == auction_house.key() @ AuctionError::BidAuctionMismatch,
        seeds = [BID_SEED, auction_house.key().as_ref(), bidder.key().as_ref()],
        bump = sealed_bid.bump
    )]
    pub sealed_bid: Account<'info, SealedBid>,
    #[account(
        mut,
        seeds = [VAULT_SEED, auction_house.key().as_ref()],
        bump = auction_house.vault_bump
    )]
    /// CHECK: Vault PDA validated by seeds + bump.
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub bidder: Signer<'info>,
}

/// Closes a bidder's sealed-bid account after settlement/refund safety checks.
#[derive(Accounts)]
pub struct CloseSealedBid<'info> {
    pub auction_house: Account<'info, AuctionHouse>,
    #[account(
        mut,
        close = bidder,
        has_one = bidder,
        constraint = sealed_bid.auction == auction_house.key() @ AuctionError::BidAuctionMismatch,
        constraint = auction_house.finalized @ AuctionError::AuctionNotFinalized,
        constraint = sealed_bid.bidder == auction_house.winner || sealed_bid.refund_claimed @ AuctionError::CloseNotAllowed,
        seeds = [BID_SEED, auction_house.key().as_ref(), bidder.key().as_ref()],
        bump = sealed_bid.bump
    )]
    pub sealed_bid: Account<'info, SealedBid>,
    #[account(mut)]
    pub bidder: Signer<'info>,
}
