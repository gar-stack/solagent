import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { LAMPORTS_PER_SOL, rpcCall, type RpcBalanceResult } from '@/lib/solanaRpc';

interface SolanaProvider {
  isPhantom?: boolean;
  isConnected?: boolean;
  publicKey?: { toString(): string };
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  on?: (event: 'accountChanged', handler: (publicKey: { toString(): string } | null) => void) => void;
  off?: (event: 'accountChanged', handler: (publicKey: { toString(): string } | null) => void) => void;
}

declare global {
  interface Window {
    solana?: SolanaProvider;
  }
}

interface MasterWalletContextValue {
  address: string | null;
  balance: number | null;
  role: 'viewer' | 'operator' | 'admin';
  canOperateAgents: boolean;
  canControlPlane: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
}

const MasterWalletContext = createContext<MasterWalletContextValue | null>(null);

function parseWalletAllowlist(value: string | undefined): Set<string> {
  if (!value) return new Set();
  return new Set(
    value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  );
}

const ADMIN_ALLOWLIST = parseWalletAllowlist(import.meta.env.VITE_ADMIN_WALLETS);
const OPERATOR_ALLOWLIST = parseWalletAllowlist(import.meta.env.VITE_OPERATOR_WALLETS);

function resolveRole(address: string | null): 'viewer' | 'operator' | 'admin' {
  if (!address) return 'viewer';
  if (ADMIN_ALLOWLIST.has(address)) return 'admin';
  if (OPERATOR_ALLOWLIST.has(address)) return 'operator';
  return 'viewer';
}

export function MasterWalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    if (!address) return;
    const result = await rpcCall<RpcBalanceResult>('getBalance', [address, { commitment: 'confirmed' }]);
    setBalance(result.value / LAMPORTS_PER_SOL);
  }, [address]);

  const connect = async () => {
    if (!window.solana?.isPhantom) {
      toast.error('Phantom wallet not detected');
      return;
    }

    setIsConnecting(true);
    try {
      const result = await window.solana.connect();
      const nextAddress = result.publicKey.toString();
      setAddress(nextAddress);
      const bal = await rpcCall<RpcBalanceResult>('getBalance', [nextAddress, { commitment: 'confirmed' }]);
      setBalance(bal.value / LAMPORTS_PER_SOL);
      toast.success('Master wallet connected');
    } catch (error) {
      toast.error(`Wallet connection failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await window.solana?.disconnect();
      setAddress(null);
      setBalance(null);
      toast.info('Master wallet disconnected');
    } catch (error) {
      toast.error(`Disconnect failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  };

  useEffect(() => {
    const provider = window.solana;
    if (!provider) return;

    const onAccountChanged = (publicKey: { toString(): string } | null) => {
      if (!publicKey) {
        setAddress(null);
        setBalance(null);
        return;
      }

      const nextAddress = publicKey.toString();
      setAddress(nextAddress);
      void rpcCall<RpcBalanceResult>('getBalance', [nextAddress, { commitment: 'confirmed' }])
        .then((bal) => setBalance(bal.value / LAMPORTS_PER_SOL))
        .catch(() => setBalance(null));
    };

    provider.on?.('accountChanged', onAccountChanged);

    if (provider.isConnected && provider.publicKey) {
      const nextAddress = provider.publicKey.toString();
      setAddress(nextAddress);
      void rpcCall<RpcBalanceResult>('getBalance', [nextAddress, { commitment: 'confirmed' }])
        .then((bal) => setBalance(bal.value / LAMPORTS_PER_SOL))
        .catch(() => setBalance(null));
    }

    return () => {
      provider.off?.('accountChanged', onAccountChanged);
    };
  }, []);

  const value = useMemo(() => {
    const role = resolveRole(address);
    return {
      address,
      balance,
      role,
      canOperateAgents: address ? role !== 'viewer' : false,
      canControlPlane: address ? role === 'admin' : false,
      isConnecting,
      connect,
      disconnect,
      refresh,
    };
  }, [address, balance, isConnecting, refresh]);

  return <MasterWalletContext.Provider value={value}>{children}</MasterWalletContext.Provider>;
}

export function useMasterWallet() {
  const context = useContext(MasterWalletContext);
  if (!context) {
    throw new Error('useMasterWallet must be used inside MasterWalletProvider');
  }
  return context;
}
