import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { toast } from 'sonner';
import { LAMPORTS_PER_SOL, rpcCall, type RpcBalanceResult } from '@/lib/solanaRpc';
import { parseWalletAllowlist, resolveRoleFromAllowlists } from './walletRoles';

interface MasterWalletContextValue {
  address: string | null;
  walletName: string | null;
  hasWalletSelection: boolean;
  selectedWalletReady: WalletReadyState | null;
  balance: number | null;
  role: 'viewer' | 'operator' | 'admin';
  canOperateAgents: boolean;
  canControlPlane: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
}

const MasterWalletContext = createContext<MasterWalletContextValue | null>(null);

const ADMIN_ALLOWLIST = parseWalletAllowlist(import.meta.env.VITE_ADMIN_WALLETS);
const OPERATOR_ALLOWLIST = parseWalletAllowlist(import.meta.env.VITE_OPERATOR_WALLETS);

export function MasterWalletProvider({ children }: { children: React.ReactNode }) {
  const {
    publicKey,
    wallet,
    connected,
    connecting,
    connect: walletConnect,
    disconnect: walletDisconnect,
  } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const address = publicKey?.toBase58() ?? null;

  const refresh = useCallback(async () => {
    if (!address) return;
    const result = await rpcCall<RpcBalanceResult>('getBalance', [address, { commitment: 'confirmed' }]);
    setBalance(result.value / LAMPORTS_PER_SOL);
  }, [address]);

  const connect = useCallback(async () => {
    if (!wallet) {
      toast.error('No wallet selected. Choose a wallet from the wallet picker.');
      return;
    }

    if (wallet.readyState === WalletReadyState.Unsupported || wallet.readyState === WalletReadyState.NotDetected) {
      toast.error(`${wallet.adapter.name} is not available in this browser`);
      return;
    }

    try {
      await walletConnect();
      toast.success('Master wallet connected');
    } catch (error) {
      toast.error(`Wallet connection failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }, [wallet, walletConnect]);

  const disconnect = useCallback(async () => {
    try {
      await walletDisconnect();
      toast.info('Master wallet disconnected');
    } catch (error) {
      toast.error(`Disconnect failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }, [walletDisconnect]);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      return;
    }

    let cancelled = false;
    void rpcCall<RpcBalanceResult>('getBalance', [address, { commitment: 'confirmed' }])
      .then((bal) => {
        if (!cancelled) {
          setBalance(bal.value / LAMPORTS_PER_SOL);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBalance(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  const value = useMemo(() => {
    const role = resolveRoleFromAllowlists(address, ADMIN_ALLOWLIST, OPERATOR_ALLOWLIST);
    return {
      address,
      walletName: wallet?.adapter.name ?? null,
      hasWalletSelection: Boolean(wallet),
      selectedWalletReady: wallet?.readyState ?? null,
      balance,
      role,
      canOperateAgents: address ? role !== 'viewer' : false,
      canControlPlane: address ? role === 'admin' : false,
      isConnecting: connecting,
      isConnected: connected,
      connect,
      disconnect,
      refresh,
    };
  }, [address, wallet, balance, connecting, connected, refresh, connect, disconnect]);

  return <MasterWalletContext.Provider value={value}>{children}</MasterWalletContext.Provider>;
}

export function useMasterWallet() {
  const context = useContext(MasterWalletContext);
  if (!context) {
    throw new Error('useMasterWallet must be used inside MasterWalletProvider');
  }
  return context;
}
