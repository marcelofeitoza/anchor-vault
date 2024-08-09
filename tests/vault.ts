import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { expect } from "chai";

describe("Vault", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Vault as Program<Vault>;
    const user = new anchor.web3.Keypair();
    const withdraw_limit = Math.floor(Date.now() / 1000) + 5; // 5 seconds
    const LAMPORTS_PER_SOL = 1_000_000_000;

    const [state] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("state"), user.publicKey.toBytes()],
        program.programId
    );
    const [vault] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), state.toBytes()],
        program.programId
    );

    const getBalance = async (publicKey: anchor.web3.PublicKey) =>
        (await provider.connection.getBalance(publicKey)) / LAMPORTS_PER_SOL;

    const airdrop = async (publicKey: anchor.web3.PublicKey, amount: number) =>
        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(publicKey, amount)
        );

    const initializeVault = async () =>
        await program.methods
            .initialize(new anchor.BN(withdraw_limit))
            .accountsPartial({
                user: user.publicKey,
                state: state,
                vault: vault,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([user])
            .rpc();

    const deposit = async (amount: number) =>
        await program.methods
            .deposit(new anchor.BN(amount))
            .accountsPartial({
                user: user.publicKey,
                vault: vault,
                state: state,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([user])
            .rpc();

    const withdraw = async (amount: number) =>
        await program.methods
            .withdraw(new anchor.BN(amount))
            .accountsPartial({
                user: user.publicKey,
                vault: vault,
                state: state,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([user])
            .rpc();

    before(async () => {
        await airdrop(user.publicKey, 5 * LAMPORTS_PER_SOL);
    });

    it("Initializes the vault", async () => {
        await initializeVault();

        const userBalance = await getBalance(user.publicKey);
        const vaultBalance = await getBalance(vault);

        expect(userBalance).to.be.greaterThanOrEqual(4.9);
        expect(vaultBalance).to.be.equal(0);
    });

    it("Makes a deposit", async () => {
        const amount = 1 * LAMPORTS_PER_SOL;
        await deposit(amount);

        const userBalance = await getBalance(user.publicKey);
        const vaultBalance = await getBalance(vault);

        expect(userBalance).to.be.closeTo(3.9, 0.1);
        expect(vaultBalance).to.be.equal(1);
    });

    it("Errors trying to withdraw before the lock duration", async () => {
        const amount = 0.5 * LAMPORTS_PER_SOL;

        try {
            await withdraw(amount);
        } catch (e) {
            expect(e).to.be.equal(
                "You can't withdraw before the lock duration ends."
            );
        }
    });

    it("Waits for the lock duration & makes a withdraw", async () => {
        await new Promise((resolve) => setTimeout(resolve, 5 * 1000));

        const amount = 0.5 * LAMPORTS_PER_SOL;
        await withdraw(amount);

        const userBalance = await getBalance(user.publicKey);
        const vaultBalance = await getBalance(vault);

        expect(userBalance).to.be.closeTo(5, 0.1);
        expect(vaultBalance).to.be.equal(0);
    });
});