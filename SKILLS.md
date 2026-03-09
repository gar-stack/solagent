# SKILLS.md - SolAgent for AI Agents

> **Instructions for AI Agents using SolAgent**

This document provides guidance for AI agents that will interact with the SolAgent system. If you are an AI agent reading this, follow these instructions to effectively use the SolAgent toolkit.

## 🎯 Your Purpose

As an AI agent using SolAgent, your role is to:

1. **Manage a cryptocurrency wallet** on the Solana blockchain
2. **Make autonomous decisions** about transactions and trades
3. **Execute actions** without human intervention (within safety bounds)
4. **Report your activities** through logs and the dashboard

## 📋 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    How You Interact                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   You (AI Agent)                                            │
│        │                                                     │
│        ▼                                                     │
│   ┌─────────────┐                                           │
│   │  analyze()  │ ──► Fetch market data, prices, indicators │
│   └──────┬──────┘                                           │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────┐                                           │
│   │  decide()   │ ──► Apply strategy, determine action      │
│   └──────┬──────┘                                           │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────┐                                           │
│   │  validate() │ ──► Check safety constraints              │
│   └──────┬──────┘                                           │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────┐                                           │
│   │  execute()  │ ──► Sign and send transaction             │
│   └──────┬──────┘                                           │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────┐                                           │
│   │    log()    │ ──► Record decision and outcome           │
│   └─────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Your Wallet

### Getting Your Wallet

When initialized, you will receive an `AgenticWallet` instance:

```typescript
// Your wallet is provided to you
constructor(wallet: AgenticWallet, config: AgentConfig) {
  this.wallet = wallet;
  this.config = config;
}
```

### Wallet Information You Can Access

```typescript
// Your public address (share this freely)
const myAddress = this.wallet.getAddress();

// Your current SOL balance
const solBalance = await this.wallet.getSolBalance();

// Your token balances
const tokens = await this.wallet.getTokenAccounts();

// Complete wallet state
const state = await this.wallet.getWalletState();
```

### What You CAN Do

✅ **Check balances** - Always know your financial state
✅ **Analyze markets** - Fetch price data and indicators
✅ **Make decisions** - Decide to trade, hold, or provide liquidity
✅ **Sign transactions** - Automatically sign approved transactions
✅ **Transfer SOL** - Send SOL to other addresses
✅ **Transfer tokens** - Send SPL tokens
✅ **Log activities** - Record all your decisions

### What You CANNOT Do (Safety Limits)

❌ **Exceed transaction limits** - Configured in `maxTransactionAmount`
❌ **Trade blacklisted tokens** - Defined in `blacklistedTokens`
❌ **Act during cooldown** - Must wait between actions
❌ **Trade non-whitelisted tokens** - If whitelist is defined
❌ **Exceed risk parameters** - Based on your risk level

## 🧠 Your Decision-Making Process

### Step 1: Analyze the Market

```typescript
async analyzeMarket(tokenMint?: string): Promise<MarketData> {
  // Fetch current market conditions
  // Return: price, volume, priceChange24h, liquidity
  
  const marketData = {
    price: 150.00,           // Current price in USD
    volume24h: 1000000,      // 24h trading volume
    priceChange24h: 2.5,     // 24h price change %
    liquidity: 500000        // Available liquidity
  };
  
  return marketData;
}
```

### Step 2: Make a Decision

```typescript
async makeDecision(walletState: WalletState, marketData?: MarketData): Promise<AgentDecision> {
  // Analyze data and return a decision
  
  const decision = {
    action: 'transfer',      // What to do
    params: {                // Action parameters
      to: 'recipient_address',
      amount: 0.5,
      token: 'SOL'
    },
    confidence: 0.75,        // How confident you are (0-1)
    reason: 'Bullish signal detected, buying opportunity'
  };
  
  return decision;
}
```

### Available Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `transfer` | Send SOL or tokens | `to`, `amount`, `token?` |
| `swap` | Exchange one token for another | `fromToken`, `toToken`, `amount` |
| `stake` | Stake SOL | `amount`, `validator?` |
| `unstake` | Unstake SOL | `amount` |
| `provide_liquidity` | Add to liquidity pool | `poolId`, `amountA`, `amountB` |
| `remove_liquidity` | Remove from liquidity pool | `poolId`, `percentage` |
| `hold` | Do nothing | - |

### Step 3: Confidence Scoring

Always provide a confidence score (0.0 to 1.0):

- **0.0 - 0.3**: Very uncertain, probably should hold
- **0.3 - 0.5**: Uncertain, weak signal
- **0.5 - 0.7**: Moderate confidence, acceptable to act
- **0.7 - 0.9**: High confidence, good signal
- **0.9 - 1.0**: Very high confidence, strong signal

**Note**: Decisions with confidence < 0.6 will not be executed automatically.

## ⚙️ Your Configuration

You receive configuration when created:

```typescript
interface AgentConfig {
  name: string;                    // Your name
  description: string;             // What you do
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  maxTransactionAmount: number;    // Max SOL per transaction
  cooldownPeriod: number;          // Milliseconds between actions
  allowedActions: string[];        // Actions you're permitted to take
  blacklistedTokens: string[];     // Tokens you cannot trade
  whitelistedTokens?: string[];    // If set, only these tokens allowed
}
```

### Risk Levels

| Level | Description | Typical Use |
|-------|-------------|-------------|
| `conservative` | Low risk, prioritize capital preservation | Stable strategies, large positions |
| `moderate` | Balanced risk/reward | Standard trading, diversified |
| `aggressive` | High risk, maximize returns | Small positions, high volatility |

## 📊 Tracking Your Performance

### Decision Log

All your decisions are automatically logged:

```typescript
{
  timestamp: Date;
  decision: AgentDecision;
  executed: boolean;      // Whether you actually did it
  signature?: string;     // Transaction signature if executed
}
```

### Status Information

Your status is tracked:

```typescript
{
  name: string;
  isRunning: boolean;
  walletAddress: string;
  lastActionTime: number;
  totalDecisions: number;
  executedDecisions: number;
}
```

## 🔄 Your Execution Loop

When started, you run in a loop:

1. **Wait for cooldown** (if applicable)
2. **Get wallet state** (balances, positions)
3. **Analyze market** (fetch data)
4. **Make decision** (apply strategy)
5. **Validate decision** (check safety)
6. **Execute** (if valid and confident)
7. **Log result**
8. **Repeat**

```typescript
// You don't need to implement this - it's handled for you
protected async runCycle(): Promise<void> {
  // 1. Check cooldown
  // 2. Get wallet state
  const walletState = await this.wallet.getWalletState();
  
  // 3. Analyze market (you implement this)
  const marketData = await this.analyzeMarket();
  
  // 4. Make decision (you implement this)
  const decision = await this.makeDecision(walletState, marketData);
  
  // 5-7. Validate, execute, log (handled automatically)
}
```

## 🛡️ Safety Checks (Automatic)

Before executing your decisions, the system checks:

1. **Confidence threshold** ≥ 0.6
2. **Action is allowed** in `allowedActions`
3. **Amount ≤ maxTransactionAmount**
4. **Token not blacklisted**
5. **Token in whitelist** (if whitelist defined)
6. **Cooldown period** has passed

If any check fails, your decision will not be executed.

## 📝 Example: Trading Bot Agent

```typescript
import { AIAgent, AgentConfig, MarketData } from '../sdk/AIAgent';
import { AgenticWallet, AgentDecision, WalletState } from '../sdk/AgenticWallet';

class MyTradingBot extends AIAgent {
  
  async analyzeMarket(tokenMint?: string): Promise<MarketData> {
    // Fetch price from your data source
    const price = await fetchPrice(tokenMint || 'SOL');
    const volume = await fetchVolume(tokenMint || 'SOL');
    
    return {
      price,
      volume24h: volume,
      priceChange24h: calculateChange(price),
      liquidity: await fetchLiquidity(tokenMint || 'SOL')
    };
  }
  
  async makeDecision(walletState: WalletState, marketData?: MarketData): Promise<AgentDecision> {
    const solBalance = walletState.solBalance;
    const price = marketData?.price || 0;
    const change = marketData?.priceChange24h || 0;
    
    // Simple strategy: Buy on dip, sell on rise
    if (change < -3 && solBalance > 0.5) {
      return {
        action: 'transfer',
        params: {
          to: 'DEX_ADDRESS',
          amount: Math.min(solBalance * 0.1, 0.5),
          token: 'SOL'
        },
        confidence: 0.7,
        reason: `Price dropped ${change}%, buying opportunity`
      };
    }
    
    if (change > 5) {
      return {
        action: 'transfer',
        params: {
          to: this.wallet.getAddress(),
          amount: 0.3,
          token: 'SOL'
        },
        confidence: 0.75,
        reason: `Price rose ${change}%, taking profits`
      };
    }
    
    return {
      action: 'hold',
      params: {},
      confidence: 0.5,
      reason: 'No clear trading signal'
    };
  }
}
```

## 🌐 Network Information

### Devnet (Recommended for Testing)

- **RPC**: https://api.devnet.solana.com
- **Faucet**: Use `wallet.requestAirdrop(amount)`
- **Explorer**: https://explorer.solana.com/?cluster=devnet
- **Purpose**: Testing and development

### Mainnet-beta (Production)

- **RPC**: https://api.mainnet-beta.solana.com
- **Explorer**: https://explorer.solana.com
- **Purpose**: Real transactions with real value

## 📞 Getting Help

If you encounter issues:

1. Check the [API Reference](docs/API_REFERENCE.md)
2. Review example agents in `src/agents/`
3. Check logs for error messages
4. Consult the dashboard for status

## 🎓 Best Practices

1. **Always check balance** before making decisions
2. **Provide clear reasons** for your decisions
3. **Use appropriate confidence** scores
4. **Respect cooldown periods**
5. **Log everything** for transparency
6. **Handle errors gracefully**
7. **Test on devnet** before mainnet

## 🔗 Important Links

- Solana Docs: https://solana.com/docs
- Web3.js API: https://solana-labs.github.io/solana-web3.js/
- SPL Token: https://spl.solana.com/

---

**Remember**: You are an autonomous agent, but you operate within safety constraints. Your goal is to make profitable decisions while preserving capital and following the rules set in your configuration.

Good luck! 🤖💰
