import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { program } from "../anchor/setup";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Multisig, Transaction } from "../types";
import { useNavigate } from "react-router-dom";
import ApprovedTransactions from "./ApprovedTransactions";
import UnapprovedTransactions from "./UnapprovedTransactions";
import ExecutedTransactions from "./ExecutedTransactions";
import ReceiveModal from "./ReceiveModal";
import SendModal from "./SendModal";

import "../styles/Transactions.css";

const LAMPORTS_PER_SOL = 1000000000;

export default function Transactions() {
  const { walletAddress } = useParams();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [multisig, setMultisig] = useState<Multisig | null>(null);
  const [executedTransactions, setExecutedTransactions] = useState<
    Transaction[]
  >([]);
  const [approvedTransactions, setApprovedTransactions] = useState<
    Transaction[]
  >([]);
  const [unapprovedTransactions, setUnapprovedTransactions] = useState<
    Transaction[]
  >([]);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (publicKey) {
      fetchMultisig();
      program.addEventListener("multisigFundedEvent", async () => {
        console.log("EVENT CAUGHT: multisigFundedEvent");
        await fetchMultisig();
      }),
        program.addEventListener("transactionApprovedEvent", async () => {
          console.log("EVENT CAUGHT: transactionApprovedEvent");
          await fetchMultisig();
        }),
        program.addEventListener("transactionCreatedEvent", async () => {
          console.log("EVENT CAUGHT: transactionCreatedEvent");
          await fetchMultisig();
        }),
        program.addEventListener("transactionExecutedEvent", async () => {
          console.log("EVENT CAUGHT: transactionExecutedEvent");
          await fetchMultisig();
        }),
        program.addEventListener("transactionRevokedEvent", async () => {
          console.log("EVENT CAUGHT: transactionRevokedEvent");
          await fetchMultisig();
        });
    }
  }, [publicKey]);

  const fetchMultisig = async () => {
    if (publicKey) {
      const multisig = await program.account.multisigWallet.fetch(
        new PublicKey(walletAddress as string)
      );

      const executed = multisig.txs.filter((tx) => tx.isExecuted);
      const approved = multisig.txs.filter(
        (tx) =>
          !tx.isExecuted &&
          tx.signers.some(
            (signer: PublicKey) => signer.toBase58() === publicKey?.toBase58()
          )
      );

      const unapproved = multisig.txs.filter(
        (tx) =>
          !tx.isExecuted &&
          !tx.signers.some(
            (signer: PublicKey) => signer.toBase58() === publicKey?.toBase58()
          )
      );

      const formattedExecuted = executed.map((tx) => ({
        id: tx.id,
        recipient: tx.recipient,
        amount: tx.amount,
        isExecuted: tx.isExecuted,
        signers: tx.signers,
      }));

      if (formattedExecuted) {
        setExecutedTransactions(formattedExecuted);
      }

      const formattedApproved = approved.map((tx) => ({
        id: tx.id,
        recipient: tx.recipent,
        amount: tx.amount,
        isExecuted: tx.isExecuted,
        signers: tx.signers,
      }));

      if (formattedApproved) {
        setApprovedTransactions(formattedApproved);
      }

      const formattedUnapproved = unapproved.map((tx) => ({
        id: tx.id,
        recipient: tx.recipent,
        amount: tx.amount,
        isExecuted: tx.isExecuted,
        signers: tx.signers,
      }));

      if (formattedUnapproved) {
        setUnapprovedTransactions(formattedUnapproved);
      }

      setMultisig({
        name: multisig.name,
        threshold: multisig.threshold,
        bump: multisig.bump,
        publicKey: new PublicKey(walletAddress as string),
        balance:
          (await connection.getBalance(
            new PublicKey(walletAddress as string)
          )) / LAMPORTS_PER_SOL,
        owners: multisig.owners,
        txs: multisig.txs,
      });
    }
  };

  const handleOpenModal = () => setShowReceiveModal(true);
  const handleCloseModal = () => setShowReceiveModal(false);

  const handleDeposit = (amount: number) => {
    console.log("Deposited amount:", amount);
  };

  const handleOpenSendModal = () => setShowSendModal(true);
  const handleCloseSendModal = () => setShowSendModal(false);

  const handleSendMoney = (amount: number, recipient: PublicKey) => {
    console.log("Amount to send:", amount);
    console.log("Recipient address:", recipient.toBase58());
  };
  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="container">
      <button onClick={handleBackClick} className="back-button">
        Back
      </button>
      <h1>{multisig?.name}</h1>
      <div className="title">
        <div className="info-div">
          <h2>{multisig?.balance} SOL</h2>
          <a
            href={`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="multisig-address"
          >
            {walletAddress}
          </a>
          <div className="transfer-buttons-section">
            <button
              className="transfer-button"
              onClick={() => handleOpenModal()}
            >
              Recieve
            </button>
            <button className="transfer-button" onClick={handleOpenSendModal}>
              Send
            </button>
          </div>
        </div>
        {multisig?.owners && multisig.owners.length > 0 && (
          <div className="owners-div">
            <h2>Owners - {multisig.threshold} signers required</h2>
            <div className="owners-list-container">
              <ul>
                {multisig.owners.map((owner, index) => (
                  <li key={index}>
                    <a
                      href={`https://explorer.solana.com/address/${owner.toBase58()}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="owner-link"
                    >
                      {owner.toBase58()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="transactions-sections">
        <ApprovedTransactions
          approvedTransactions={approvedTransactions}
          threshold={multisig?.threshold as number}
          walletAddress={new PublicKey(walletAddress as string)}
        />
        <UnapprovedTransactions
          unapprovedTransactions={unapprovedTransactions}
          threshold={multisig?.threshold as number}
          walletAddress={new PublicKey(walletAddress as string)}
        />

        <ExecutedTransactions
          executedTransactions={executedTransactions}
          threshold={multisig?.threshold as number}
          walletAddress={new PublicKey(walletAddress as string)}
        />
      </div>
      <ReceiveModal
        show={showReceiveModal}
        onClose={handleCloseModal}
        onSubmit={handleDeposit}
        walletAddress={walletAddress as string}
      />
      <SendModal
        show={showSendModal}
        onClose={handleCloseSendModal}
        onSubmit={handleSendMoney}
        walletAddress={walletAddress as string}
      />
    </div>
  );
}
