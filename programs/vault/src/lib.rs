use anchor_lang::prelude::*;

mod state;
use state::*;

mod context;
use context::*;

mod errors;

declare_id!("HqLgpRCGL41gvWf35M8uGGmKenq6WpAJSMVrT2pKpCeL");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, lock_duration: Option<i64>) -> Result<()> {
        ctx.accounts.initialize(&ctx.bumps, lock_duration)
    }

    pub fn deposit(ctx: Context<Payments>, amount: u64) -> Result<()> {
        ctx.accounts.deposit(amount)
    }

    pub fn withdraw(ctx: Context<Payments>, amount: u64) -> Result<()> {
        ctx.accounts.withdraw(amount)
    }

    pub fn close(ctx: Context<Close>) -> Result<()> {
        ctx.accounts.close()
    }
}
