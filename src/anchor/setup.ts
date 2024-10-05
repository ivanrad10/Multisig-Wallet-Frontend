import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { MultisigWallet } from "./multisig";
import IDL from "./idl.json";
import { clusterApiUrl, Connection } from "@solana/web3.js";

// export const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");


// Initialize the program interface with the IDL, program ID, and connection.
// This setup allows us to interact with the on-chain program using the defined interface.
export const program = new Program<MultisigWallet>(IDL as MultisigWallet, {
    connection,
});

// This is just a TypeScript type for the account data structures based on the IDL
// We need this so TypeScript doesn't yell at us
export type MultisigAccount = IdlAccounts<MultisigWallet>["multisigWallet"];