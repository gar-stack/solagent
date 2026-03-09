import { useMemo } from 'react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import type { WalletAdapter } from '@solana/wallet-adapter-base';
import { DEVNET_RPC_URL } from '@/lib/solanaRpc';

function tryCreateWallet(name: string, factory: () => WalletAdapter): WalletAdapter | null {
  try {
    return factory();
  } catch (error) {
    console.error(`[wallet] Failed to initialize ${name} adapter`, error);
    return null;
  }
}

export function WalletAdapterProviders({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(
    () =>
      [
        tryCreateWallet('Phantom', () => new PhantomWalletAdapter()),
        tryCreateWallet('Solflare', () => new SolflareWalletAdapter()),
        tryCreateWallet('Backpack', () => new BackpackWalletAdapter()),
      ].filter((wallet): wallet is WalletAdapter => wallet !== null),
    []
  );

  return (
    <ConnectionProvider endpoint={DEVNET_RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
