import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { program } from "../anchor/setup";
import { Multisig } from "../types";
import { useNavigate } from "react-router-dom";
import myImage from "../assets/Group_LE_auto_x2.jpg";
import Modal from "./CreateWalletForm";
import MultisigForm from "./MultisigForm";

import "../styles/Multisigs.css";
import { PublicKey } from "@solana/web3.js";
const LAMPORTS_PER_SOL = 1000000000;

export default function Multisigs() {
  const [multisigs, setMultisigs] = useState<Multisig[]>();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (publicKey) {
      fetchAllMultisigs();
      program.addEventListener("multisigCreatedEvent", async () => {
        console.log("EVENT CAUGHT: multisigCreatedEvent");
        fetchAllMultisigs();
      });
    } else {
      console.error("Wallet not connected");
    }
  }, [publicKey]);

  const fetchAllMultisigs = async () => {
    try {
      let wallets = await program.account.multisigWallet.all();

      wallets = wallets.filter((wallet) =>
        wallet.account.owners.some((owner) =>
          owner.equals(publicKey as PublicKey)
        )
      );

      const formattedMultisigs = await Promise.all(
        wallets.map(async (wallet: any) => ({
          name: wallet.account.name,
          threshold: wallet.account.threshold,
          bump: wallet.account.bump,
          publicKey: wallet.publicKey,
          balance:
            (await connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL,
          owners: wallet.account.owners,
          txs: wallet.account.txs,
        }))
      );

      if (formattedMultisigs) {
        setMultisigs(formattedMultisigs);
      }
    } catch (error) {
      console.error("Error fetching counter data:", error);
    }
  };

  const handleAddClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      {publicKey ? (
        <div className="multisig-cards-container">
          {multisigs &&
            multisigs.map((multisig, index) => (
              <div key={index} className="multisig-card">
                <div className="multisig-header">{multisig.name}</div>
                <div className="header-line">
                  {" "}
                  <h1></h1>
                </div>
                <div className="balance">
                  {multisig.balance} SOL
                  <div className="wallet-address">
                    <a
                      href={`https://explorer.solana.com/address/${multisig.publicKey}?cluster=devnet`}
                      className="wallet-address-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {multisig.publicKey.toBase58().slice(0, 4)}...
                      {multisig.publicKey.toBase58().slice(-4)}
                    </a>
                  </div>
                </div>
                <div className="threshold">
                  <span>Owners:</span>{" "}
                  <span className="threshold-value">
                    {multisig.owners.length}
                  </span>
                </div>
                <div className="threshold">
                  <span>Threshold:</span>{" "}
                  <span className="threshold-value">{multisig.threshold}</span>
                </div>
                <button
                  className="related-transactions-button"
                  onClick={() => navigate(`/${multisig.publicKey}`)}
                >
                  Overview
                </button>
              </div>
            ))}

          <div className="multisig-add-card">
            <div className="add-image">
              <img src={myImage} alt="Add New Wallet" />
            </div>
            <div className="add-multisig-container">
              <div className="add-multisig">
                <button className="plus-button" onClick={handleAddClick}>
                  +
                </button>
                <span className="add-text">Add New Multisig</span>
              </div>
            </div>
          </div>

          <Modal show={showModal} onClose={handleCloseModal}>
            <MultisigForm />
          </Modal>
        </div>
      ) : (
        <div className="connect-wallet-message">
          <h2>Connect your wallet to see all multisigs</h2>
        </div>
      )}
    </div>
  );
}
