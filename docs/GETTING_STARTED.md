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
