import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MasterWalletProvider } from '@/contexts/MasterWalletContext';
import { WalletAdapterProviders } from '@/contexts/WalletAdapterProviders';
import '@solana/wallet-adapter-react-ui/styles.css';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <WalletAdapterProviders>
        <MasterWalletProvider>
          <App />
        </MasterWalletProvider>
      </WalletAdapterProviders>
    </BrowserRouter>
  </StrictMode>
);
