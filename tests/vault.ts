import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { expect } from "chai";

describe("Vault", () => {
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);

	const program = anchor.workspace.Vault as Program<Vault>;

	const user = new anchor.web3.Keypair();

	const withdraw_limit = Math.floor(Date.now() / 1000) + 5; // 5 secondss

	const state = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from("state"), user.publicKey.toBytes()],
		program.programId
	)[0];
	const vault = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from("vault"), state.toBytes()],
		program.programId
	)[0];

	const LAMPORTS_PER_SOL = 1_000_000_000;

	before(async () => {
		await provider.connection.confirmTransaction(
			await provider.connection.requestAirdrop(
				user.publicKey,
				5 * LAMPORTS_PER_SOL
			)
		);
	});

	it("Initializes the vault", async () => {
		await program.methods
			.initialize(
				new anchor.BN(withdraw_limit) // lock_duration
			)
			.accountsPartial({
				user: user.publicKey,
				state: state,
				vault: vault,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.signers([user])
			.rpc();

		const userBalance =
			(await provider.connection.getBalance(user.publicKey)) /
			LAMPORTS_PER_SOL;
		const vaultBalance =
			(await provider.connection.getBalance(vault)) / LAMPORTS_PER_SOL;

		expect(userBalance).to.be.greaterThanOrEqual(4.9);
		expect(vaultBalance).to.be.equal(0);
	});

	it("Makes a deposit", async () => {
		const amount = 1 * LAMPORTS_PER_SOL;
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

		const userBalance =
			(await provider.connection.getBalance(user.publicKey)) /
			LAMPORTS_PER_SOL;
		const vaultBalance =
			(await provider.connection.getBalance(vault)) / LAMPORTS_PER_SOL;

		expect(userBalance).to.be.closeTo(3.9, 0.1);
		expect(vaultBalance).to.be.equal(1);
	});

	it("Errors trying to withdraw before the lock duration", async () => {
		const amount = 0.5 * LAMPORTS_PER_SOL;

		try {
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
		} catch (e) {
			expect(e).to.be.equal(
				"You can't withdraw before the lock duration ends."
			);
		}
	});

	it("Waits for the lock duration & makes a withdraw", async () => {
		await new Promise((resolve) => setTimeout(resolve, 5 * 1000));

		const amount = 0.5 * LAMPORTS_PER_SOL;
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

		const userBalance =
			(await provider.connection.getBalance(user.publicKey)) /
			LAMPORTS_PER_SOL;
		const vaultBalance =
			(await provider.connection.getBalance(vault)) / LAMPORTS_PER_SOL;

		expect(userBalance).to.be.closeTo(5, 0.1);
		expect(vaultBalance).to.be.equal(0);
	});
});
