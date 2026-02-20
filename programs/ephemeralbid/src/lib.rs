use anchor_lang::prelude::*;

declare_id!("HK92WjG3LE4JCWi5mU7pAvLz1JFBUwwh1v3obB9ajwnE");

#[program]
pub mod ephemeralbid {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
