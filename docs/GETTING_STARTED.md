# Getting Started with SolAgent

## Prerequisites

- Node.js 18+
- npm
- Basic TypeScript and Solana familiarity

## Install

```bash
git clone https://github.com/gar-stack/solagent.git
cd solagent
npm install
```

## Run Dashboard

```bash
npm run dev
```

Optional `.env` role mapping for dashboard RBAC and deployment metadata:

```bash
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_OPERATOR_WALLETS=<comma-separated-wallets>
VITE_ADMIN_WALLETS=<comma-separated-wallets>
VITE_APP_URL=https://solagenticwallet.vercel.app/
```

Web note:
- Dashboard access requires connecting a master wallet in-browser (Phantom, Solflare, Backpack).
- Connected wallets not in allowlists default to `viewer` role (read-only controls).
- CLI/SDK users can run agent workflows without web login.

## Web Wallet Setup

1. Click `Select Wallet` in top navigation.
2. Pick Phantom, Solflare, or Backpack in the wallet modal.
3. Connect and verify your role badge (`viewer`, `operator`, or `admin`).
4. Open `/dashboard` and confirm role-based controls.

## Validate Project

```bash
npm run lint
npm run build
npm run build:cli
npm test
```

## Run CLI Binary

```bash
npm run build:cli
node dist-cli/solagent.cjs --help
```

## Deploy To Vercel (GitHub Auto-Deploy)

1. Connect the GitHub repository to Vercel.
2. Set `VITE_SOLANA_RPC_URL`, `VITE_OPERATOR_WALLETS`, `VITE_ADMIN_WALLETS`, and `VITE_APP_URL`.
3. Push to `main` to trigger production deployment.
4. Use pull requests for automatic preview deployments.

See full guide: [Deployment Guide](./DEPLOYMENT.md)

Post-deploy checklist:
1. Open `/`, `/docs`, and `/dashboard` with hard refresh.
2. Verify dashboard redirects when wallet is disconnected.
3. Connect each supported wallet and verify role behavior.
4. Confirm footer live-app link opens deployed URL.

## Milestone 1 Control Plane

```bash
# Emergency stop / resume
node dist-cli/solagent.cjs control:pause --reason "incident response"
node dist-cli/solagent.cjs control:status
node dist-cli/solagent.cjs control:resume

# Policy lifecycle
node dist-cli/solagent.cjs policy:apply --file ./policy.json
node dist-cli/solagent.cjs policy:show
node dist-cli/solagent.cjs policy:rollback --version 1

# Audit verification
node dist-cli/solagent.cjs audit:tail --limit 20
node dist-cli/solagent.cjs audit:verify

# Runtime telemetry
node dist-cli/solagent.cjs metrics:show
```

## Create a Wallet (SDK)

```ts
import { AgenticWallet } from './src/sdk';

const wallet = AgenticWallet.generate({ network: 'devnet' });
console.log(wallet.getAddress());
```

## Fund Wallet (Devnet)

```ts
await wallet.requestAirdrop(1);
console.log(await wallet.getSolBalance());
```

## Transfer SOL

```ts
await wallet.transferSol('<recipient_pubkey>', 0.1);
```

## Start an Agent

```ts
import { TradingBot } from './src/agents/TradingBot';

const bot = new TradingBot(wallet, {
  name: 'Alpha Trader',
  description: 'Prototype RSI bot',
  riskLevel: 'moderate',
  maxTransactionAmount: 1,
  cooldownPeriod: 300000,
  allowedActions: ['transfer', 'hold'],
  blacklistedTokens: [],
}, {
  buyThreshold: -2,
  sellThreshold: 5,
  stopLoss: 3,
  takeProfit: 10,
  maxPositionSize: 0.5,
});

await bot.start(60000);
```

## Notes

- Trading and LP bots ingest live SOL signals with fallback sources.
- Dashboard fetches live devnet balances, signatures, and slot/block-height data.
- CLI is packaged locally through `npm run build:cli`.
