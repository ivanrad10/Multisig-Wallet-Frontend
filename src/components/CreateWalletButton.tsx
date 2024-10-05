import React from "react";
import { program } from "../anchor/setup";
import { web3 } from "@coral-xyz/anchor";
import { SystemProgram, PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

interface CreateWalletProps {
  walletAddresses: string[];
  isDisabled: boolean;
  threshold: number;
  name: string;
}

const CreateWallet: React.FC<CreateWalletProps> = ({
  walletAddresses,
  isDisabled,
  threshold,
  name,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const createWallet = async () => {
    const pda = await generateMultisigPda(walletAddresses);

    const transaction = await program.methods
      .initializeMultisig(name, stringToPubkey(walletAddresses), threshold)
      .accountsStrict({
        multisigWallet: pda,
        signer: publicKey as PublicKey,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const transactionSignature = await sendTransaction(transaction, connection);

    console.log("Tx sig: " + transactionSignature);
  };

  const generateMultisigPda = async (owners: string[]): Promise<PublicKey> => {
    try {
      const response = await fetch("http://localhost:3000/multisig/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ owners }),
      });

      const awaitedResponse = await response.json();
      let seed = Uint8Array.from(Object.values(awaitedResponse));

      const [pdaWalletAddr] = web3.PublicKey.findProgramAddressSync(
        [seed],
        program.programId
      );

      return pdaWalletAddr;
    } catch (error) {
      console.error("Error sending request to backend:", error);
      throw error;
    }
  };

  const stringToPubkey = (owners: string[]): PublicKey[] => {
    console.log(owners.map((owner) => new PublicKey(owner)));
    return owners.map((owner) => new PublicKey(owner));
  };

  return (
    <button
      onClick={createWallet}
      disabled={isDisabled}
      className="create-wallet-button"
    >
      Create Wallet
    </button>
  );
};

export default CreateWallet;
