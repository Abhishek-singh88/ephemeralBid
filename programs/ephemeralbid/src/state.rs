use anchor_lang::prelude::*;

/// Global auction state for one auction instance.
#[account]
pub struct AuctionHouse {
    pub authority: Pubkey,
    pub auction_id: u64,
    pub min_bid: u64,
    pub min_increment: u64,
    pub highest_bid: u64,
    pub winner: Pubkey,
    pub end_time: i64,
    pub bidder_count: u32,
    pub committed_count: u32,
    pub settled_count: u32,
    pub finalized: bool,
    pub proceeds_claimed: bool,
    pub bump: u8,
    pub vault_bump: u8,
}

impl AuctionHouse {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 8 + 32 + 8 + 4 + 4 + 4 + 1 + 1 + 1 + 1;
}

/// Lifecycle of an individual bidder's private bid account.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum BidStatus {
    Ready,
    Active,
    Committed,
}

impl Default for BidStatus {
    fn default() -> Self {
        Self::Ready
    }
}

/// Bidder-specific sealed bid state. Delegated/committed via ER/PER flow.
#[account]
#[derive(Default)]
pub struct SealedBid {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
    pub deposited: u64,
    pub status: BidStatus,
    pub committed: bool,
    pub settled: bool,
    pub refund_claimed: bool,
    pub bump: u8,
}

impl SealedBid {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 1 + 1 + 1 + 1 + 1;
}
