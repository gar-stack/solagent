export const DEVNET_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
export const LAMPORTS_PER_SOL = 1_000_000_000;

export interface RpcResponse<T> {
  result: T;
  error?: {
    message: string;
  };
}

export interface RpcSignatureInfo {
  signature: string;
  err: unknown;
  blockTime: number | null;
}

export interface RpcBalanceResult {
  value: number;
}

export async function rpcCall<T>(method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(DEVNET_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  const json = (await response.json()) as RpcResponse<T>;
  if (json.error) {
    throw new Error(json.error.message);
  }

  return json.result;
}
