use anchor_lang::prelude::*;

#[event]
pub struct AuctionCreated {
    pub auction: Pubkey,
    pub authority: Pubkey,
    pub auction_id: u64,
    pub min_bid: u64,
    pub min_increment: u64,
    pub ends_at: i64,
}

#[event]
pub struct BidSubmitted {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
}

#[event]
pub struct BidCommitted {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
}

#[event]
pub struct BidSettled {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
    pub current_highest_bid: u64,
    pub current_winner: Pubkey,
}

#[event]
pub struct AuctionFinalized {
    pub auction: Pubkey,
    pub winner: Pubkey,
    pub final_bid: u64,
}

#[event]
pub struct SellerProceedsClaimed {
    pub auction: Pubkey,
    pub authority: Pubkey,
    pub amount: u64,
}

#[event]
pub struct RefundClaimed {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
}
