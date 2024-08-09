# Anchor Vault Program

## Overview

This Anchor-based Solana vault program allows users to securely initialize vaults, deposit SOL, withdraw under specific conditions, and close their vaults. It integrates system-level operations with custom error handling and state management for enhanced security and functionality.

## Features

-   **Initialize Vaults**: Users can create vaults with optional lock durations.
-   **Deposit Funds**: Users can deposit SOL into their vaults.
-   **Withdraw Funds**: Withdrawals are regulated by lock durations and are only permissible under specific conditions.
-   **Close Vaults**: Allows users to close their vaults and retrieve funds.

## Usage

To use this program, perform the following commands:

-   **Initialize a vault**
-   **Deposit into a vault**
-   **Withdraw from a vault**
-   **Close a vault**

## Code Structure

-   **lib.rs**: Entry point of the program, handles high-level logic.
-   **errors.rs**: Defines custom errors for the program.
-   **state**, **context**: Manage state and context for transactions.
-   **payment.rs**, **close.rs**, **initialize.rs**: Implement functionalities like payment handling, initialization, and closing operations.
-   **vault.rs**: Defines the VaultState structure and associated logic.

## Testing

To run the tests:

1. **Set up the local environment**:
    - Ensure your localnet is running.
    - Deploy the program to your localnet.
2. **Install dependencies**:
    - `yarn` to install necessary packages.
3. **Execute the tests**:
    - `anchor test`

### Test Cases

-   **Initialize the vault**: Ensures the vault initializes with the correct parameters.
-   **Deposit functionality**: Validates that deposits adjust user and vault balances correctly.
-   **Withdraw functionality**: Tests withdrawal behavior, including adherence to lock durations.
-   **Error handling**: Ensures proper errors are thrown for unauthorized withdrawals before the lock duration ends.
