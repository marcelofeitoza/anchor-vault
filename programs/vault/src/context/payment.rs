use crate::{errors::VaultErrors, VaultState};
use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

#[derive(Accounts)]
pub struct Payments<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"vault", state.key().as_ref()],
        bump = state.vault_bump,
    )]
    pub vault: SystemAccount<'info>,
    #[account(
        seeds = [b"state", user.key().as_ref()],
        bump = state.state_bump,
    )]
    pub state: Account<'info, VaultState>,
    pub system_program: Program<'info, System>,
}

impl<'info> Payments<'info> {
    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        let transfer_accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.vault.to_account_info(),
        };
        let transfer_ctx =
            CpiContext::new(self.system_program.to_account_info(), transfer_accounts);
        transfer(transfer_ctx, amount)
    }

    pub fn withdraw(&mut self, amount: u64) -> Result<()> {
        let current_time = Clock::get()?.unix_timestamp;

        if let Some(lock_duration) = self.state.lock_duration {
            if let Some(last_withdrawal) = self.state.last_withdrawal {
                if current_time < last_withdrawal + lock_duration {
                    return Err(VaultErrors::WithdrawLocked.into());
                }
            }
        }

        msg!("Current time: {}", current_time);
        msg!("Last withdrawal: {:?}", self.state.last_withdrawal);

        let cpi_program = self.system_program.to_account_info();

        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.user.to_account_info(),
        };

        let seeds = &[
            b"vault",
            self.state.to_account_info().key.as_ref(),
            &[self.state.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        transfer(cpi_ctx, amount)?;

        self.state.last_withdrawal = Some(current_time);

        Ok(())
    }
}
