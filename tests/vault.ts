import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";

describe("Vault", () => {
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);

	const program = anchor.workspace.Vault as Program<Vault>;

	const user = new anchor.web3.Keypair();

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

	afterEach(async () => {
		console.log(
			"\tUser balance",
			(await provider.connection.getBalance(user.publicKey)) /
				LAMPORTS_PER_SOL
		);
		console.log(
			"\tVault balance",
			(await provider.connection.getBalance(vault)) / LAMPORTS_PER_SOL
		);
	});

	it("Initializes the vault", async () => {
		const tx = await program.methods
			.initialize()
			.accountsPartial({
				user: user.publicKey,
				state: state,
				vault: vault,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.signers([user])
			.rpc();
		console.log("\t\nYour transaction signature", tx);

		const currentState = await program.account.vaultState.fetch(state);
		console.log("\tState", currentState);
	});

	it("Makes a deposit", async () => {
		const amount = 1 * LAMPORTS_PER_SOL;
		const tx = await program.methods
			.deposit(new anchor.BN(amount))
			.accountsPartial({
				user: user.publicKey,
				vault: vault,
				state: state,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.signers([user])
			.rpc();
		console.log("\t\nYour transaction signature", tx);

		const currentState = await program.account.vaultState.fetch(state);
		console.log("\tState", currentState);
	});

	it("Makes a withdraw", async () => {
		const amount = 0.5 * LAMPORTS_PER_SOL;
		const tx = await program.methods
			.withdraw(new anchor.BN(amount))
			.accountsPartial({
				user: user.publicKey,
				vault: vault,
				state: state,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.signers([user])
			.rpc();
		console.log("\t\nYour transaction signature", tx);

		const currentState = await program.account.vaultState.fetch(state);
		console.log("\tState", currentState);
	});

	it("Closes the vault", async () => {
		const tx = await program.methods
			.close()
			.accountsStrict({
				user: user.publicKey,
				vault: vault,
				state: state,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.signers([user])
			.rpc();
		console.log("\t\nYour transaction signature", tx);

		try {
			const currentState = await program.account.vaultState.fetch(state);
			console.log("\tState", currentState);
		} catch (error) {
			console.log("\tState has been closed and does not exist anymore.");
		}
	});
});
