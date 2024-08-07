use anchor_lang::prelude::*;

#[error_code]
pub enum VaultErrors {
    #[msg("Invalid owner")]
    InvalidOwner,
    #[msg("Insufficient user funds")]
    InsufficientUserFunds,
    #[msg("Insufficient vault funds")]
    InsufficientVaultFunds,
    #[msg("Withdraw is locked")]
    WithdrawLocked,
}
