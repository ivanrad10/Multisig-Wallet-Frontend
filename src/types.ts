import { PublicKey } from '@solana/web3.js';


export type Multisig = {
    name: string,
    threshold: number;
    bump: number;
    publicKey: PublicKey;
    balance: number;
    owners: PublicKey[];
    txs: Transaction[];
}

export type Transaction = {
    id: number;
    recipient: PublicKey;
    amount: BigInt;
    isExecuted: boolean;
    signers: PublicKey[];
}