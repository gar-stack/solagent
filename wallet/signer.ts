import {
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey
} from "@solana/web3.js";

import { connection } from "../utils/connection";

export async function sendSOL(sender: any, receiver: string, amount: number) {

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: new PublicKey(receiver),
      lamports: amount
    })
  );

  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [sender]
  );

  console.log("Transaction sent:", signature);

  return signature;
}
