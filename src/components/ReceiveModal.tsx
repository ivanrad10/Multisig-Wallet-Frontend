import React, { useState } from "react";
import { program } from "../anchor/setup";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import "../styles/ReceiveModal.css";
import { BN } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const LAMPORTS_PER_SOL = 1000000000;

type ReceiveModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void; // Callback to handle deposit amount;
  walletAddress: string;
};

const ReceiveModal: React.FC<ReceiveModalProps> = ({
  show,
  onClose,
  walletAddress,
}) => {
  const [amount, setAmount] = useState("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount) * LAMPORTS_PER_SOL;

    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      try {
        const transaction = await program.methods
          .fundMultisig(new BN(parsedAmount))
          .accountsStrict({
            multisigWallet: new PublicKey(walletAddress),
            signer: publicKey as PublicKey,
            systemProgram: SystemProgram.programId,
          })
          .transaction();

        const transactionSignature = await sendTransaction(
          transaction,
          connection
        );

        console.log("Transaction signature: " + transactionSignature);

        setAmount("");
        onClose();
      } catch (error) {
        console.error("Error creating or sending transaction:", error);
        alert(
          "There was an error processing the transaction. Please try again."
        );
      }
    } else {
      alert("Please enter a valid amount.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-button" onClick={onClose}>
          &times;
        </button>
        <h2>Deposit Amount</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button type="submit">Deposit</button>
        </form>
      </div>
    </div>
  );
};

export default ReceiveModal;
