# Deep Dive: SolAgent Architecture

This document provides a comprehensive technical explanation of SolAgent's design, architecture, and implementation.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Wallet Design](#wallet-design)
4. [AI Agent Framework](#ai-agent-framework)
5. [Security Model](#security-model)
6. [Decision Engine](#decision-engine)
7. [Transaction Flow](#transaction-flow)

## Overview

SolAgent is a toolkit for building autonomous AI agents that interact with the Solana blockchain. It provides:

- Programmatic wallet creation and management
- Automatic transaction signing
- Extensible AI agent framework
- Safety controls and risk management
- Real-time monitoring dashboard

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SolAgent Stack                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Dashboard │  │     CLI     │  │      AI Agents          │ │
│  │   (React)   │  │   (Node)    │  │  (Trading/LP/Custom)    │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                      │               │
│         └────────────────┼──────────────────────┘               │
│                          │                                       │
│              ┌───────────┴───────────┐                          │
│              │    AgenticWallet      │                          │
│              │      (SDK Core)       │                          │
│              │  • Key Management     │                          │
│              │  • Transaction Signing│                          │
│              │  • Balance Management │                          │
│              └───────────┬───────────┘                          │
│                          │                                       │
│              ┌───────────┴───────────┐                          │
│              │    Solana Web3.js     │                          │
│              │  • JSON RPC API       │                          │
│              │  • SPL Token Program  │                          │
│              │  • System Program     │                          │
│              └───────────┬───────────┘                          │
│                          │                                       │
│              ┌───────────┴───────────┐                          │
│              │    Solana Network     │                          │
│              │  (Devnet/Testnet/     │                          │
│              │   Mainnet-beta)       │                          │
│              └───────────────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Wallet Design

### Key Generation

SolAgent uses Ed25519 for cryptographic operations:

```typescript
// Keypair generation
const keypair = Keypair.generate();

// Secret key: 64 bytes (private key + public key)
// Public key: 32 bytes
```

### Wallet State Management

```typescript
interface WalletState {
  address: string;        // Base58 encoded public key
  solBalance: number;     // SOL balance
  tokens: TokenBalance[]; // SPL token balances
  lastUpdated: Date;      // Last refresh timestamp
}
```

### Transaction Signing Flow

```
1. Create Transaction
   └─> Add instructions (transfer, token transfer, etc.)

2. Sign Transaction
   └─> Use keypair.secretKey to sign
   └─> Add signature to transaction

3. Send Transaction
   └─> Send to Solana RPC
   └─> Wait for confirmation

4. Confirm Transaction
   └─> Poll for confirmation status
   └─> Return transaction signature
```

## AI Agent Framework

### Base Agent Class

```typescript
abstract class AIAgent {
  // Core properties
  protected wallet: AgenticWallet;
  protected config: AgentConfig;
  protected isRunning: boolean;
  
  // Abstract methods (must implement)
  abstract analyzeMarket(tokenMint?: string): Promise<MarketData>;
  abstract makeDecision(walletState: WalletState, marketData?: MarketData): Promise<AgentDecision>;
  
  // Common methods
  start(intervalMs: number): Promise<void>;
  stop(): void;
  getStatus(): AgentStatus;
}
```

### Agent Lifecycle

```
┌─────────────┐
│   Created   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Configured │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   Running   │◄────┤   Stopped   │
└──────┬──────┘     └─────────────┘
       │
       │ Cycle:
       │ 1. Analyze market
       │ 2. Make decision
       │ 3. Validate
       │ 4. Execute (if valid)
       │ 5. Log
       │ 6. Wait interval
       │
       ▼
┌─────────────┐
│  Destroyed  │
└─────────────┘
```

## Security Model

### Defense in Depth

```
Layer 1: Configuration
├─ Risk levels
├─ Transaction limits
└─ Action whitelists

Layer 2: Validation
├─ Confidence thresholds
├─ Cooldown periods
└─ Token blacklists

Layer 3: Execution
├─ Manual approval (optional)
├─ Multi-sig (future)
└─ Emergency stop

Layer 4: Monitoring
├─ Decision logs
├─ Transaction history
└─ Alerting
```

### Permission Matrix

| Action | Conservative | Moderate | Aggressive |
|--------|-------------|----------|------------|
| Transfer | ≤ 0.5 SOL | ≤ 2 SOL | ≤ 5 SOL |
| Swap | Whitelist only | Verified tokens | Any token |
| Stake | No | Yes | Yes |
| LP | Stable pairs only | Any pair | Any pair |
| Cooldown | 10 min | 5 min | 1 min |

## Decision Engine

### Decision Structure

```typescript
interface AgentDecision {
  action: 'transfer' | 'swap' | 'stake' | 'unstake' | 
          'provide_liquidity' | 'remove_liquidity' | 'hold';
  params: {
    to?: string;
    amount?: number;
    token?: string;
    // ... action-specific params
  };
  confidence: number;  // 0.0 - 1.0
  reason: string;      // Human-readable explanation
}
```

### Validation Pipeline

```
Decision
   │
   ▼
┌─────────────────┐
│ Confidence >= 0.6? │──No──> Reject
└────────┬────────┘
         │ Yes
         ▼
┌─────────────────┐
│ Action allowed? │──No──> Reject
└────────┬────────┘
         │ Yes
         ▼
┌─────────────────┐
│ Amount <= max?  │──No──> Reject
└────────┬────────┘
         │ Yes
         ▼
┌─────────────────┐
│ Token allowed?  │──No──> Reject
└────────┬────────┘
         │ Yes
         ▼
┌─────────────────┐
│ Cooldown passed?│──No──> Wait
└────────┬────────┘
         │ Yes
         ▼
    Execute!
```

## Transaction Flow

### SOL Transfer Example

```typescript
// 1. Create instruction
const instruction = SystemProgram.transfer({
  fromPubkey: wallet.publicKey,
  toPubkey: new PublicKey(recipient),
  lamports: amount * LAMPORTS_PER_SOL
});

// 2. Create transaction
const transaction = new Transaction().add(instruction);

// 3. Sign transaction
transaction.partialSign(keypair);

// 4. Send transaction
const signature = await connection.sendTransaction(
  transaction, 
  [keypair]
);

// 5. Confirm transaction
await connection.confirmTransaction(signature);
```

### Token Transfer Example

```typescript
// 1. Get token accounts
const fromTokenAccount = await getAssociatedTokenAddress(
  mint,
  wallet.publicKey
);

const toTokenAccount = await getAssociatedTokenAddress(
  mint,
  recipientPublicKey
);

// 2. Create instruction
const instruction = createTransferInstruction(
  fromTokenAccount,
  toTokenAccount,
  wallet.publicKey,
  amount * Math.pow(10, decimals)
);

// 3-5. Same as SOL transfer
```

## Trading Bot Strategy

### RSI-Based Strategy

```typescript
async makeDecision(walletState, marketData) {
  const rsi = this.calculateRSI('SOL', 14);
  const price = marketData.price;
  
  // Oversold condition - Buy signal
  if (rsi < 30) {
    return {
      action: 'transfer',
      params: { to: DEX, amount: 0.1 },
      confidence: 0.7,
      reason: `RSI oversold: ${rsi}`
    };
  }
  
  // Overbought condition - Sell signal
  if (rsi > 70) {
    return {
      action: 'transfer',
      params: { to: wallet.address, amount: 0.1 },
      confidence: 0.7,
      reason: `RSI overbought: ${rsi}`
    };
  }
  
  // Hold
  return {
    action: 'hold',
    params: {},
    confidence: 0.5,
    reason: 'No clear signal'
  };
}
```

## Liquidity Provider Strategy

### APY-Based Selection

```typescript
async makeDecision(walletState, marketData) {
  // Find best pool by risk-adjusted APY
  const pools = this.getPools();
  const eligiblePools = pools.filter(p => 
    p.apy >= this.strategy.minApy &&
    p.impermanentLoss24h <= this.strategy.maxImpermanentLoss
  );
  
  // Sort by APY / IL ratio
  eligiblePools.sort((a, b) => 
    (b.apy / b.impermanentLoss24h) - 
    (a.apy / a.impermanentLoss24h)
  );
  
  const bestPool = eligiblePools[0];
  
  if (bestPool) {
    return {
      action: 'provide_liquidity',
      params: {
        poolId: bestPool.id,
        amountA: walletState.solBalance * 0.1,
        amountB: walletState.solBalance * 0.1
      },
      confidence: 0.75,
      reason: `Best APY: ${bestPool.apy}%`
    };
  }
  
  return { action: 'hold', params: {}, confidence: 0.5, reason: 'No good pools' };
}
```

## Monitoring & Observability

### Metrics Tracked

- **Financial**: Balance, P&L, ROI
- **Operational**: Decisions made, actions executed
- **Performance**: Win rate, average return, Sharpe ratio
- **Risk**: Max drawdown, volatility

### Dashboard Integration

```typescript
// Agent status
const status = agent.getStatus();
// {
//   name: 'Alpha Trader',
//   isRunning: true,
//   walletAddress: '7xKX...',
//   lastActionTime: 1234567890,
//   totalDecisions: 156,
//   executedDecisions: 89
// }

// Decision log
const log = agent.getDecisionLog();
// Array of { timestamp, decision, executed, signature }
```

## Future Enhancements

1. **Multi-signature support** - Require multiple approvals for large transactions
2. **Hardware wallet integration** - Use Ledger/Trezor for key storage
3. **MEV protection** - Integration with Jito or Flashbots
4. **Cross-chain support** - Wormhole integration for cross-chain operations
5. **Machine learning** - Train models on historical data for better predictions
6. **Social trading** - Copy trading from successful agents

## Conclusion

SolAgent provides a robust foundation for building autonomous AI agents on Solana. Its modular architecture, comprehensive security features, and extensible design make it suitable for a wide range of DeFi applications.

The key innovations are:

1. **Separation of concerns** - Clear boundaries between wallet, agent, and strategy
2. **Safety-first design** - Multiple layers of protection
3. **Extensibility** - Easy to add new agent types and strategies
4. **Observability** - Comprehensive monitoring and logging

---

For questions or contributions, visit: https://github.com/superteamng/solagent
