use anchor_lang::prelude::*;

#[account]
pub struct VaultState {
    pub vault_bump: u8,
    pub state_bump: u8,
    pub lock_duration: Option<i64>,
    pub last_withdraw: Option<i64>,
}

impl Space for VaultState {
    const INIT_SPACE: usize = 8 + std::mem::size_of::<VaultState>();
}
