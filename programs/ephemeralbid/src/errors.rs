use anchor_lang::prelude::*;

/// Program-level errors for the private auction lifecycle.
#[error_code]
pub enum AuctionError {
    #[msg("Auction is still active")]
    AuctionActive,
    #[msg("Auction has ended")]
    AuctionEnded,
    #[msg("Auction already finalized")]
    AuctionFinalized,
    #[msg("Auction not finalized")]
    AuctionNotFinalized,
    #[msg("Bid increment is too small")]
    BidIncrementTooSmall,
    #[msg("Bid is below auction minimum")]
    BidBelowMinimum,
    #[msg("Cannot delegate this account in its current state")]
    CannotDelegate,
    #[msg("Bid account is not delegated")]
    AccountNotDelegated,
    #[msg("Bid account is not committed")]
    BidNotCommitted,
    #[msg("Bid account has already been settled")]
    BidAlreadySettled,
    #[msg("There are unsettled committed bids")]
    UnsettledCommittedBids,
    #[msg("Bid account is linked to a different auction")]
    BidAuctionMismatch,
    #[msg("Duration must be greater than zero")]
    InvalidDuration,
    #[msg("Minimum bid must be greater than zero")]
    InvalidMinBid,
    #[msg("Integer overflow")]
    MathOverflow,
    #[msg("Seller proceeds have already been claimed")]
    ProceedsAlreadyClaimed,
    #[msg("No winning bid in this auction")]
    NoWinningBid,
    #[msg("Winner cannot claim refund")]
    WinnerNoRefund,
    #[msg("Refund already claimed")]
    RefundAlreadyClaimed,
    #[msg("No refundable amount available")]
    NoRefundAvailable,
    #[msg("Vault balance is insufficient")]
    InsufficientVaultBalance,
    #[msg("Bid account cannot be closed yet")]
    CloseNotAllowed,
}
