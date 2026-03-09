# Getting Started with SolAgent

This guide will help you get started with SolAgent, the agentic wallet toolkit for AI agents on Solana.

## Prerequisites

- Node.js 18+ installed
- Basic knowledge of TypeScript/JavaScript
- Understanding of Solana blockchain concepts

## Installation

### Option 1: Clone the Repository

```bash
git clone https://github.com/superteamng/solagent.git
cd solagent
npm install
```

### Option 2: Use as a Dependency

```bash
npm install solagent
```

## Quick Start

### 1. Create a Wallet

```typescript
import { AgenticWallet } from 'solagent';

// Create a new wallet on devnet
const wallet = AgenticWallet.generate({
  network: 'devnet',
  commitment: 'confirmed'
});

console.log('Address:', wallet.getAddress());
console.log('Private Key:', wallet.getPrivateKey()); // Save this securely!
```

### 2. Fund Your Wallet (Devnet)

```typescript
// Request SOL airdrop (devnet only)
const signature = await wallet.requestAirdrop(2);
console.log('Airdrop signature:', signature);

// Check balance
const balance = await wallet.getSolBalance();
console.log('Balance:', balance, 'SOL');
```

### 3. Transfer SOL

```typescript
// Transfer SOL to another address
const recipient = ' recipient_address_here';
const amount = 0.5; // SOL

const txSignature = await wallet.transferSol(recipient, amount);
console.log('Transaction:', txSignature);
```

### 4. Create an AI Trading Agent

```typescript
import { TradingBot } from 'solagent';

const bot = new TradingBot(wallet, {
  name: 'My Trading Bot',
  description: 'RSI-based trading strategy',
  riskLevel: 'moderate',
  maxTransactionAmount: 1.0,
  cooldownPeriod: 300000, // 5 minutes
  allowedActions: ['transfer', 'swap', 'hold'],
  blacklistedTokens: []
}, {
  buyThreshold: -2,     // Buy when price drops 2%
  sellThreshold: 5,     // Sell when price rises 5%
  stopLoss: 3,          // 3% stop loss
  takeProfit: 10,       // 10% take profit
  maxPositionSize: 0.5  // Max 0.5 SOL per trade
});

// Start the bot
await bot.start(60000); // Check every minute

// Stop the bot
bot.stop();
```

## Using the CLI

SolAgent includes a command-line interface for easy management:

### Create a Wallet

```bash
npx solagent wallet:create --network devnet --save
```

### Check Balance

```bash
npx solagent wallet:balance
```

### Request Airdrop

```bash
npx solagent wallet:airdrop --amount 2
```

### Start Trading Bot

```bash
npx solagent agent:trading --name "Alpha Trader" --risk moderate
```

### Start Liquidity Provider

```bash
npx solagent agent:liquidity --min-apy 5
```

## Configuration

Create a `.solagent.json` file in your project root:

```json
{
  "network": "devnet",
  "rpcUrl": "https://api.devnet.solana.com",
  "defaultWallet": "your_private_key_here"
}
```

## Next Steps

- Read the [API Reference](API_REFERENCE.md) for detailed documentation
- Learn about [Security Best Practices](SECURITY.md)
- Explore [Agent Development](AGENTS.md) to build custom agents
- Check out the [SKILLS.md](../SKILLS.md) for AI agent instructions

## Troubleshooting

### Common Issues

**Error: "Airdrop is only available on devnet or testnet"**
- Make sure you're using `network: 'devnet'` or `network: 'testnet'`

**Error: "Insufficient funds"**
- Request an airdrop first or fund your wallet with devnet SOL

**Error: "Invalid private key"**
- Ensure the private key is base58 encoded
- Check that the key is complete (88 characters)

### Getting Help

## Examples

See the `examples/` directory for more complete examples:

- `basic-wallet.ts` - Basic wallet operations
- `trading-bot.ts` - Complete trading bot setup
- `liquidity-provider.ts` - Liquidity provision example
- `multi-agent.ts` - Managing multiple agents
