/// PDA seed prefix for each auction account.
pub const AUCTION_SEED: &[u8] = b"auction";
/// PDA seed prefix for each bidder's sealed bid account.
pub const BID_SEED: &[u8] = b"bid";
/// PDA seed prefix for per-auction escrow vault account.
pub const VAULT_SEED: &[u8] = b"vault";

/// Default validator used for ER/PER delegation on devnet.
pub const DEVNET_ASIA_ER_VALIDATOR: &str = "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57";
