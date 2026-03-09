import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@solana/wallet-adapter-react-ui/styles.css';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found');
}
const appRoot = rootElement;

function formatError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

function renderFatal(error: unknown): void {
  appRoot.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#020617;color:#e2e8f0;font-family:ui-sans-serif,system-ui,sans-serif;">
      <div style="max-width:720px;width:100%;border:1px solid #334155;border-radius:12px;padding:20px;background:#0f172a;">
        <h1 style="margin:0 0 12px;font-size:18px;line-height:1.3;">Failed to start SolAgent</h1>
        <p style="margin:0 0 8px;color:#94a3b8;">A runtime error blocked initial rendering.</p>
        <pre style="margin:0;white-space:pre-wrap;word-break:break-word;color:#fca5a5;">${formatError(error)}</pre>
      </div>
    </div>
  `;
}

window.addEventListener('error', (event) => {
  renderFatal(event.error ?? event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  renderFatal(event.reason);
});

async function bootstrap() {
  try {
    const [{ BrowserRouter }, { MasterWalletProvider }, { WalletAdapterProviders }, { default: App }] =
      await Promise.all([
        import('react-router-dom'),
        import('@/contexts/MasterWalletContext'),
        import('@/contexts/WalletAdapterProviders'),
        import('./App.tsx'),
      ]);

    createRoot(appRoot).render(
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
  } catch (error) {
    console.error('Application bootstrap failed', error);
    renderFatal(error);
  }
}

void bootstrap();
