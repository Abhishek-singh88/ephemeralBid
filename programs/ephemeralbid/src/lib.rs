use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::ephemeral;

pub mod constants;
pub mod contexts;
pub mod errors;
pub mod events;
pub mod handlers;
pub mod state;
pub mod utils;

use contexts::*;
use handlers::*;

declare_id!("HK92WjG3LE4JCWi5mU7pAvLz1JFBUwwh1v3obB9ajwnE");

#[ephemeral]
#[program]
pub mod ephemeralbid {
    use super::*;

    pub fn create_auction(
        ctx: Context<CreateAuction>,
        auction_id: u64,
        min_bid: u64,
        min_increment: u64,
        duration: i64,
    ) -> Result<()> {
        create_auction_handler(ctx, auction_id, min_bid, min_increment, duration)
    }

    pub fn initialize_sealed_bid(ctx: Context<InitializeSealedBid>) -> Result<()> {
        initialize_sealed_bid_handler(ctx)
    }

    pub fn delegate_bid(ctx: Context<DelegateBid>) -> Result<()> {
        delegate_bid_handler(ctx)
    }

    pub fn submit_sealed_bid(ctx: Context<SubmitSealedBid>, amount: u64) -> Result<()> {
        submit_sealed_bid_handler(ctx, amount)
    }

    pub fn commit_bid(ctx: Context<CommitBid>) -> Result<()> {
        commit_bid_handler(ctx)
    }

    pub fn commit_bid_l1(ctx: Context<CommitBidL1>) -> Result<()> {
        commit_bid_l1_handler(ctx)
    }

    pub fn settle_committed_bid(ctx: Context<SettleCommittedBid>) -> Result<()> {
        settle_committed_bid_handler(ctx)
    }

    pub fn finalize_auction(ctx: Context<FinalizeAuction>) -> Result<()> {
        finalize_auction_handler(ctx)
    }

    pub fn claim_seller_proceeds(ctx: Context<ClaimSellerProceeds>) -> Result<()> {
        claim_seller_proceeds_handler(ctx)
    }

    pub fn claim_refund(ctx: Context<ClaimRefund>) -> Result<()> {
        claim_refund_handler(ctx)
    }

    pub fn close_sealed_bid(ctx: Context<CloseSealedBid>) -> Result<()> {
        close_sealed_bid_handler(ctx)
    }
}
