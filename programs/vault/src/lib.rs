use anchor_lang::prelude::*;

mod state;
use state::*;

mod context;
use context::*;

mod errors;

declare_id!("HqLgpRCGL41gvWf35M8uGGmKenq6WpAJSMVrT2pKpCeL");

#[program]
pub mod anchor_vault_q3 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        msg!(
            "Size of VaultState: {}",
            8 + std::mem::size_of::<VaultState>()
        );
        ctx.accounts.initialize(&ctx.bumps)
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
