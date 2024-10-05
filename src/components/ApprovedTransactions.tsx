import React, { useState, useEffect } from "react";
import { Transaction } from "../types";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import peopleImage from "../assets/group (1).png";
import sendImage from "../assets/arrow.png";
import { program } from "../anchor/setup";
import { Multisig } from "../types";

import "../styles/ApprovedTransactions.css";
import { PublicKey } from "@solana/web3.js";

const LAMPORTS_PER_SOL = 1000000000;

const ApprovedTransactions: React.FC<{
  approvedTransactions: Transaction[];
  threshold: number;
  walletAddress: PublicKey;
}> = ({ approvedTransactions, threshold, walletAddress }) => {
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>(
    []
  );
  const [multisig, setMultisig] = useState<Multisig | null>(null);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  useEffect(() => {
    fetchMultisig();
  }, [selectedTransactions]);

  const fetchMultisig = async () => {
    const multisig = await program.account.multisigWallet.fetch(walletAddress);

    setMultisig({
      name: multisig.name,
      threshold: multisig.threshold,
      bump: multisig.bump,
      publicKey: walletAddress,
      balance: (await connection.getBalance(walletAddress)) / LAMPORTS_PER_SOL,
      owners: multisig.owners,
      txs: multisig.txs,
    });
  };

  const handleSelect = (id: number) => {
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(
        selectedTransactions.filter((txId) => txId !== id)
      );
    } else {
      setSelectedTransactions([...selectedTransactions, id]);
    }
  };

  const isSelected = (id: number) => selectedTransactions.includes(id);

  const isAnySelected = selectedTransactions.length > 0;

  const revoke = async () => {
    fetchMultisig();

    try {
      //handling multiple selected txs
      for (const txId of selectedTransactions) {
        const tx = multisig?.txs.find((tx) => tx.id === txId);

        const transaction = await program.methods
          .revokeTransaction(txId)
          .accountsStrict({
            multisigWallet: walletAddress,
            recipient: tx?.recipient as PublicKey,
            signer: publicKey as PublicKey,
          })
          .transaction();

        const transactionSignature = await sendTransaction(
          transaction,
          connection
        );
        console.log("Tx sig: " + transactionSignature);
      }
      fetchMultisig();
      setSelectedTransactions([]);
    } catch (error) {
      console.error("Error revoking transactions:", error);
    }
  };

  return (
    <div className="pending-transactions-container">
      <h3>Approved Transactions</h3>
      <div className="transactions-table">
        {approvedTransactions.map((tx) => (
          <div key={tx.id} className="transaction-row">
            <input
              type="checkbox"
              checked={isSelected(tx.id)}
              onChange={() => handleSelect(tx.id)}
            />
            <div className="transaction-id">{tx.id}</div>
            <div className="transaction-amount">
              <img src={sendImage} className="signers-icon" />
              {Number(tx.amount) / LAMPORTS_PER_SOL} SOL
            </div>
            <div className="transaction-signers">
              <img src={peopleImage} className="signers-icon" />
              {tx.signers.length} out of {threshold}
            </div>
          </div>
        ))}
      </div>

      <div className="transaction-actions">
        <button
          className="revoke-button"
          onClick={() => revoke()}
          disabled={!isAnySelected}
        >
          Revoke
        </button>
      </div>
    </div>
  );
};

export default ApprovedTransactions;
