import React, { useState } from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { program } from "../anchor/setup";
import "../styles/SendModal.css";
import { BN } from "@coral-xyz/anchor";

const LAMPORTS_PER_SOL = 1000000000;

type SendModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (amount: number, recipient: PublicKey) => void;
  walletAddress: string;
};

const SendModal: React.FC<SendModalProps> = ({
  show,
  onClose,
  walletAddress,
}) => {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (
      !isNaN(parsedAmount) &&
      parsedAmount > 0 &&
      PublicKey.isOnCurve(recipient)
    ) {
      try {
        const amountInLamports = new BN(parsedAmount * LAMPORTS_PER_SOL);

        const transaction = await program.methods
          .createTransaction(amountInLamports, new PublicKey(recipient))
          .accountsStrict({
            multisigWallet: new PublicKey(walletAddress as string),
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
        setRecipient("");
        onClose();
      } catch (error) {
        console.error("Error creating or sending transaction:", error);
        alert(
          "There was an error processing the transaction. Please try again."
        );
      }
    } else {
      alert("Please enter a valid amount and a valid recipient address.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-button" onClick={onClose}>
          &times;
        </button>
        <h2>Send</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default SendModal;
