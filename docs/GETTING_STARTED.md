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

Optional `.env` role mapping for dashboard RBAC:

```bash
VITE_OPERATOR_WALLETS=<comma-separated-wallets>
VITE_ADMIN_WALLETS=<comma-separated-wallets>
```

Web note:
- Dashboard access requires connecting a master wallet in-browser.
- Connected wallets not in allowlists default to `viewer` role (read-only controls).
- CLI/SDK users can run agent workflows without web login.

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

- Trading and LP bots currently use simulated market data.
- Dashboard fetches live devnet balances, signatures, and slot/block-height data.
- CLI is packaged locally through `npm run build:cli`.
