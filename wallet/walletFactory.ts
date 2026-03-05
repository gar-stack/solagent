import { Keypair } from "@solana/web3.js";
import { registerWallet } from "./walletRegistry";
import { storeKey } from "./keyManager";

export function createWallet() {
  const account = Keypair.generate();
  const address = account.publicKey.toBase58();

  // A simple hackathon-friendly unique ID based on the address
  const agentId = `agent_${address.substring(0, 8)}`;

  // Store the raw Private Key securely in the KMS layer
  storeKey(agentId, account);

  const wallet = {
    id: agentId,
    address: address
  };

  registerWallet(wallet);

  return wallet;
}
