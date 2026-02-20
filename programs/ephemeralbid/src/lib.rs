use std::str::FromStr;

use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::{
    anchor::{commit, delegate, ephemeral},
    cpi::DelegateConfig,
};

declare_id!("HK92WjG3LE4JCWi5mU7pAvLz1JFBUwwh1v3obB9ajwnE");

const AUCTION_SEED: &[u8] = b"auction";
const BID_SEED: &[u8] = b"bid";
const DEVNET_US_ER_VALIDATOR: &str = "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57";

#[ephemeral]
#[program]
pub mod ephemeralbid {
    use super::*;

    pub fn create_auction(ctx: Context<CreateAuction>, min_bid: u64, duration: i64) -> Result<()> {
        require!(duration > 0, AuctionError::InvalidDuration);

        let auction = &mut ctx.accounts.auction_house;
        auction.authority = ctx.accounts.authority.key();
        auction.highest_bid = min_bid;
        auction.end_time = Clock::get()?.unix_timestamp + duration;
        auction.winner = Pubkey::default();
        auction.bump = ctx.bumps.auction_house;

        emit!(AuctionCreated {
            auction: auction.key(),
            min_bid,
            ends_at: auction.end_time,
        });

        Ok(())
    }

    pub fn initialize_sealed_bid(ctx: Context<InitializeSealedBid>) -> Result<()> {
        let sealed_bid = &mut ctx.accounts.sealed_bid;
        sealed_bid.auction = ctx.accounts.auction_house.key();
        sealed_bid.bidder = ctx.accounts.bidder.key();
        sealed_bid.amount = 0;
        sealed_bid.status = BidStatus::Pending;
        sealed_bid.bump = ctx.bumps.sealed_bid;
        Ok(())
    }

    pub fn delegate_bid(ctx: Context<DelegateBid>) -> Result<()> {
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
                validator: Pubkey::from_str(DEVNET_US_ER_VALIDATOR).ok(),
                ..Default::default()
            },
        )?;

        ctx.accounts.sealed_bid.status = BidStatus::Delegated;
        Ok(())
    }

    pub fn submit_sealed_bid(ctx: Context<SubmitSealedBid>, amount: u64) -> Result<()> {
        let auction = &ctx.accounts.auction_house;
        require!(
            Clock::get()?.unix_timestamp < auction.end_time,
            AuctionError::AuctionEnded
        );
        require!(amount > auction.highest_bid, AuctionError::BidTooLow);

        let sealed_bid = &mut ctx.accounts.sealed_bid;
        require!(
            sealed_bid.status == BidStatus::Delegated,
            AuctionError::AccountNotDelegated
        );
        sealed_bid.amount = amount;

        emit!(BidSubmitted {
            auction: auction.key(),
            bidder: sealed_bid.bidder,
            amount,
        });

        Ok(())
    }

    pub fn commit_bid(ctx: Context<CommitBid>) -> Result<()> {
        ctx.accounts.sealed_bid.status = BidStatus::Committed;
        Ok(())
    }

    pub fn end_auction(ctx: Context<EndAuction>) -> Result<()> {
        let auction = &mut ctx.accounts.auction_house;
        require!(
            Clock::get()?.unix_timestamp >= auction.end_time,
            AuctionError::AuctionActive
        );

        let sealed_bid = &ctx.accounts.sealed_bid;
        require!(
            sealed_bid.status == BidStatus::Committed,
            AuctionError::BidNotCommitted
        );
        if sealed_bid.amount > auction.highest_bid {
            auction.highest_bid = sealed_bid.amount;
            auction.winner = sealed_bid.bidder;
        }

        emit!(AuctionEnded {
            auction: auction.key(),
            winner: auction.winner,
            final_bid: auction.highest_bid,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateAuction<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + AuctionHouse::LEN,
        seeds = [AUCTION_SEED, authority.key().as_ref()],
        bump
    )]
    pub auction_house: Account<'info, AuctionHouse>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

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

#[delegate]
#[derive(Accounts)]
pub struct DelegateBid<'info> {
    #[account(
        mut,
        has_one = bidder,
        constraint = sealed_bid.status == BidStatus::Pending @ AuctionError::CannotDelegate,
        del
    )]
    pub sealed_bid: Account<'info, SealedBid>,
    #[account(mut)]
    pub bidder: Signer<'info>,
}

#[derive(Accounts)]
pub struct SubmitSealedBid<'info> {
    #[account(mut, has_one = authority)]
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
    /// CHECK: Authority key is validated by `has_one = authority`
    pub authority: UncheckedAccount<'info>,
}

#[commit]
#[derive(Accounts)]
pub struct CommitBid<'info> {
    #[account(mut, has_one = bidder)]
    pub sealed_bid: Account<'info, SealedBid>,
    pub bidder: Signer<'info>,
}

#[derive(Accounts)]
pub struct EndAuction<'info> {
    #[account(
        mut,
        has_one = authority,
        seeds = [AUCTION_SEED, authority.key().as_ref()],
        bump = auction_house.bump
    )]
    pub auction_house: Account<'info, AuctionHouse>,
    #[account(constraint = sealed_bid.auction == auction_house.key() @ AuctionError::BidAuctionMismatch)]
    pub sealed_bid: Account<'info, SealedBid>,
    pub authority: Signer<'info>,
}

#[account]
pub struct AuctionHouse {
    pub authority: Pubkey,
    pub highest_bid: u64,
    pub end_time: i64,
    pub winner: Pubkey,
    pub bump: u8,
}

impl AuctionHouse {
    pub const LEN: usize = 32 + 8 + 8 + 32 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum BidStatus {
    Pending,
    Delegated,
    Committed,
}

impl Default for BidStatus {
    fn default() -> Self {
        Self::Pending
    }
}

#[account]
#[derive(Default)]
pub struct SealedBid {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
    pub status: BidStatus,
    pub bump: u8,
}

impl SealedBid {
    pub const LEN: usize = 32 + 32 + 8 + 1 + 1;
}

#[event]
pub struct AuctionCreated {
    pub auction: Pubkey,
    pub min_bid: u64,
    pub ends_at: i64,
}

#[event]
pub struct BidSubmitted {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
}

#[event]
pub struct AuctionEnded {
    pub auction: Pubkey,
    pub winner: Pubkey,
    pub final_bid: u64,
}

#[error_code]
pub enum AuctionError {
    #[msg("Auction is still active")]
    AuctionActive,
    #[msg("Auction has ended")]
    AuctionEnded,
    #[msg("Bid is below the current highest bid")]
    BidTooLow,
    #[msg("Cannot delegate this account in its current state")]
    CannotDelegate,
    #[msg("Bid account is not delegated")]
    AccountNotDelegated,
    #[msg("Bid account is not committed")]
    BidNotCommitted,
    #[msg("Bid account is linked to a different auction")]
    BidAuctionMismatch,
    #[msg("Duration must be greater than zero")]
    InvalidDuration,
}
