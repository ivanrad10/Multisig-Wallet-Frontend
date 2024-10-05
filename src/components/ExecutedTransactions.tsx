import React from "react";
import { Transaction } from "../types";
import peopleImage from "../assets/group (1).png";
import sendImage from "../assets/arrow.png";

import "../styles/ExecutedTransactions.css";
import { PublicKey } from "@solana/web3.js";

const LAMPORTS_PER_SOL = 1000000000;

const ExecutedTransactions: React.FC<{
  executedTransactions: Transaction[];
  threshold: number;
  walletAddress: PublicKey;
}> = ({ executedTransactions, threshold }) => {
  return (
    <div className="executed-transactions-container">
      <h3>Executed Transactions</h3>
      <div className="executed-table">
        {executedTransactions.map((tx) => (
          <div key={tx.id} className="transaction-row">
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
    </div>
  );
};

export default ExecutedTransactions;
