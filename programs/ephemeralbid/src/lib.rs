use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("HK92WjG3LE4JCWi5mU7pAvLz1JFBUwwh1v3obB9ajwnE");

#[program]
pub mod ephemeralbid {
    use super::*;

    pub fn create_auction(ctx: Context<CreateAuction>, min_bid: u64, duration: i64) -> Result<()> {
        let auction = &mut ctx.accounts.auction_house;
        auction.authority = ctx.accounts.authority.key();
        auction.highest_bid = min_bid;
        auction.end_time = Clock::get()?.unix_timestamp + duration;
        auction.winner = Pubkey::default();
        emit!(AuctionCreated {
            auction: ctx.accounts.auction_house.key(),
            min_bid,
        });
        Ok(())
    }

    pub fn submit_bid(ctx: Context<SubmitBid>, amount: u64) -> Result<()> {
        require!(Clock::get()?.unix_timestamp < ctx.accounts.auction_house.end_time, AuctionError::AuctionEnded);
        require!(amount > ctx.accounts.auction_house.highest_bid, AuctionError::BidTooLow);
        
        let bid = &mut ctx.accounts.sealed_bid;
        bid.bidder = ctx.accounts.bidder.key();
        bid.amount = amount;
        
        // TODO: Delegate to PER here (next step)
        // delegate_account(&ctx.accounts.delegate_input)?;
        
        ctx.accounts.auction_house.highest_bid = amount;
        emit!(BidSubmitted {
            auction: ctx.accounts.auction_house.key(),
            bidder: bid.bidder,
            amount,
        });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SubmitBid<'info> {
    #[account(mut)]
    pub auction_house: Account<'info, AuctionHouse>,
    #[account(
        init,
        payer = bidder,
        space = 8 + 32 + 8 + 1
    )]
    pub sealed_bid: Account<'info, SealedBid>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct AuctionHouse {
    pub authority: Pubkey,
    pub highest_bid: u64,
    pub end_time: i64,
    pub winner: Pubkey,
    pub bump: u8,
}

#[account]
pub struct SealedBid {
    pub bidder: Pubkey,
    pub amount: u64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct CreateAuction<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 32 + 1
    )]
    pub auction_house: Account<'info, AuctionHouse>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct AuctionCreated {
    pub auction: Pubkey,
    pub min_bid: u64,
}

#[event]
pub struct BidSubmitted {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum AuctionError {
    #[msg("Auction has ended")]
    AuctionEnded,
    #[msg("Bid too low")]
    BidTooLow,
}
