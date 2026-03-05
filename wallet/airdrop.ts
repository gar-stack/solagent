import { connection } from "../utils/connection";

export async function airdropSOL(address: any) {

  const signature = await connection.requestAirdrop(
    address,
    1000000000
  );

  await connection.confirmTransaction(signature);

  console.log("Airdrop successful:", signature);
}
