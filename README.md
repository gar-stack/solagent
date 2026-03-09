# SolAgent 🤖💰

> **Agentic Wallets for AI Agents on Solana**

[![Solana](https://img.shields.io/badge/Solana-Devnet-purple)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

SolAgent is a comprehensive toolkit for building autonomous AI agents that can create wallets, sign transactions, and execute DeFi strategies on the Solana blockchain without human intervention.

## 🎯 Challenge Submission

This project is submitted for the **DeFi Developer Challenge – Agentic Wallets for AI Agents** by **Superteam Nigeria**.

### Requirements Met ✅

- ✅ **Programmatic Wallet Creation** - Wallets created automatically with secure key generation
- ✅ **Automatic Transaction Signing** - AI agents sign transactions autonomously
- ✅ **SOL & SPL Token Support** - Full support for native SOL and SPL tokens
- ✅ **Test dApp Integration** - Interactive dashboard for monitoring and control
- ✅ **Deep Dive Documentation** - Comprehensive explanation of design and security
- ✅ **Open Source** - Full source code with MIT license
- ✅ **Devnet Prototype** - Working implementation on Solana devnet
- ✅ **SKILLS.md** - File for AI agents to understand the system

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/gar-stack/solagent.git
cd solagent

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Create Your First Agentic Wallet

```typescript
import { AgenticWallet, TradingBot } from './src/sdk';

// Create a new wallet
const wallet = AgenticWallet.generate({
  network: 'devnet',
  commitment: 'confirmed'
});

console.log('Wallet address:', wallet.getAddress());

// Request airdrop (devnet only)
await wallet.requestAirdrop(2);

// Check balance
const balance = await wallet.getSolBalance();
console.log('Balance:', balance, 'SOL');
```

### Start an AI Trading Agent

```typescript
import { TradingBot } from './src/agents/TradingBot';

// Initialize trading bot
const bot = new TradingBot(wallet, {
  name: 'Alpha Trader',
  description: 'Automated trading bot with RSI strategy',
  riskLevel: 'moderate',
  maxTransactionAmount: 1.0,
  cooldownPeriod: 300000,
  allowedActions: ['transfer', 'swap', 'hold'],
  blacklistedTokens: []
}, {
  buyThreshold: -2,      // Buy when price drops 2%
  sellThreshold: 5,      // Sell when price rises 5%
  stopLoss: 3,           // 3% stop loss
  takeProfit: 10,        // 10% take profit
  maxPositionSize: 0.5   // Max 0.5 SOL per position
});

// Start autonomous trading (checks every minute)
await bot.start(60000);
```

## 📁 Project Structure

```
solagent/
├── src/
│   ├── sdk/                    # Core SDK
│   │   ├── AgenticWallet.ts    # Wallet implementation
│   │   ├── AIAgent.ts          # Base agent class
│   │   └── index.ts            # SDK exports
│   ├── agents/                 # AI Agent implementations
│   │   ├── TradingBot.ts       # Trading bot agent
│   │   └── LiquidityProvider.ts # Liquidity provider agent
│   ├── cli/                    # Command-line interface
│   │   └── solagent.ts         # CLI tool
│   ├── sections/               # Dashboard components
│   │   ├── Hero.tsx            # Landing section
│   │   ├── Dashboard.tsx       # Agent monitoring dashboard
│   │   ├── Features.tsx        # Feature showcase
│   │   ├── Documentation.tsx   # Documentation section
│   │   └── Footer.tsx          # Footer
│   └── App.tsx                 # Main application
├── docs/                       # Additional documentation
├── README.md                   # This file
├── SKILLS.md                   # AI agent instructions
└── package.json
```

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Blockchain**: Solana Web3.js, SPL Token
- **Cryptography**: TweetNaCl for signing, bs58 for encoding
- **AI Agents**: Custom agent framework with extensible base class

## 💻 CLI Usage

SolAgent includes a powerful CLI for managing wallets and agents:

```bash
# Create a new wallet
npx solagent wallet:create --network devnet --save

# Check balance
npx solagent wallet:balance

# Request airdrop
npx solagent wallet:airdrop --amount 2

# Transfer SOL
npx solagent wallet:transfer --to <address> --amount 1

# Start trading bot
npx solagent agent:trading --name "My Bot" --risk moderate

# Start liquidity provider
npx solagent agent:liquidity --min-apy 5
```

## 🎨 Dashboard Features

The web dashboard provides:

- **Real-time Monitoring** - Track agent status, balances, and performance
- **Transaction History** - View all transactions with signatures
- **Agent Control** - Start/stop agents with one click
- **Analytics** - Performance metrics and statistics
- **Multi-agent Support** - Manage multiple AI agents simultaneously

## 🔐 Security Features

- **Encrypted Key Storage** - Private keys never exposed in plain text
- **Transaction Limits** - Configurable max transaction amounts
- **Whitelist Controls** - Restrict to approved tokens and addresses
- **Blacklist Support** - Block specific tokens from trading
- **Cooldown Periods** - Prevent excessive trading
- **Audit Trail** - Complete transaction history logging

## 🤖 AI Agent Types

### Trading Bot
- RSI-based trading strategy
- Moving average crossovers
- Configurable stop-loss and take-profit
- Position sizing management

### Liquidity Provider
- Automatic pool selection based on APY
- Impermanent loss monitoring
- Auto-compounding fees
- Rebalancing strategies

## 📚 Documentation

- [Getting Started Guide](docs/GETTING_STARTED.md)
- [API Reference](docs/API_REFERENCE.md)
- [Security Best Practices](docs/SECURITY.md)
- [Agent Development](docs/AGENTS.md)
- [SKILLS.md](SKILLS.md) - For AI agents

## 🧪 Testing

```bash
# Run tests
npm test

# Test on devnet
npm run test:devnet

# Build for production
npm run build
```

## 🌐 Deployment

The dashboard is deployed and accessible at:
**https://solagent-demo.vercel.app**

## 🎥 Deep Dive

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      SolAgent Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Dashboard  │    │     CLI      │    │   AI Agents  │  │
│  │   (React)    │    │   (Node.js)  │    │  (Trading/   │  │
│  │              │    │              │    │  Liquidity)  │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                   │          │
│         └───────────────────┼───────────────────┘          │
│                             │                              │
│                    ┌────────┴────────┐                     │
│                    │   AgenticWallet  │                     │
│                    │     (SDK Core)   │                     │
│                    └────────┬────────┘                     │
│                             │                              │
│                    ┌────────┴────────┐                     │
│                    │  Solana Web3.js  │                     │
│                    │  (Devnet/Mainnet)│                     │
│                    └─────────────────┘                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Wallet Design

1. **Key Generation**: Uses cryptographically secure random generation
2. **Storage**: Encrypted at rest (in production, use hardware security modules)
3. **Signing**: All transactions signed locally, never expose private keys
4. **Recovery**: Private key export for backup (with security warnings)

### AI Agent Integration

Agents follow a decision-making loop:

1. **Analyze Market** - Fetch price data, volume, indicators
2. **Make Decision** - Apply strategy to determine action
3. **Validate** - Check against safety constraints
4. **Execute** - Sign and broadcast transaction
5. **Log** - Record decision and outcome

## 🏆 Key Features

| Feature | Description |
|---------|-------------|
| **Programmatic Wallets** | Create wallets on-the-fly for each AI agent |
| **Auto Signing** | Sign transactions without human intervention |
| **Multi-Token Support** | SOL and all SPL tokens |
| **Safety Controls** | Whitelists, limits, cooldowns |
| **Extensible Agents** | Easy to build custom agent types |
| **Real-time Dashboard** | Monitor all agents in one place |
| **CLI Tool** | Command-line management |
| **TypeScript** | Full type safety |

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 🙏 Acknowledgments

- **Superteam Nigeria** for organizing the challenge
- **Solana Foundation** for the excellent documentation
- **Superteam Community** for support and feedback

## 📞 Contact

- GitHub: [@Gar Manji](https://github.com/gar-stack)
- Phone: [@Gar Manji] (tel:09039913283)
---

<p align="center">
  Built with ❤️ for the Solana ecosystem
</p>
