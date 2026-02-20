use anchor_lang::prelude::*;

use crate::errors::AuctionError;

/// Moves lamports from the program-owned vault PDA to a recipient.
/// The vault is program-owned, so direct lamport mutation is valid.
pub fn transfer_from_vault<'info>(
    vault: &AccountInfo<'info>,
    recipient: &AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    let vault_balance = vault.lamports();
    require!(
        vault_balance >= amount,
        AuctionError::InsufficientVaultBalance
    );

    {
        let mut vault_lamports = vault.try_borrow_mut_lamports()?;
        **vault_lamports = vault_lamports
            .checked_sub(amount)
            .ok_or(AuctionError::MathOverflow)?;
    }
    {
        let mut recipient_lamports = recipient.try_borrow_mut_lamports()?;
        **recipient_lamports = recipient_lamports
            .checked_add(amount)
            .ok_or(AuctionError::MathOverflow)?;
    }

    Ok(())
}
