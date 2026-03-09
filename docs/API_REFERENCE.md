# API Reference

Complete API documentation for the SolAgent SDK.

## Table of Contents

- [AgenticWallet](#agenticwallet)
- [AIAgent](#aiagent)
- [TradingBot](#tradingbot)
- [LiquidityProvider](#liquidityprovider)
- [Policy Registry](#policy-registry)
- [Audit](#audit)
- [Execution Guard](#execution-guard)
- [Market Data](#market-data)
- [Telemetry](#telemetry)

---

## AgenticWallet

The core wallet class for AI agents.

### Constructor

```typescript
constructor(config: WalletConfig, privateKey?: string)
```

**Parameters:**
- `config`: Wallet configuration
- `privateKey`: Optional private key (base58 encoded)

### Methods

#### getPublicKey()

```typescript
getPublicKey(): PublicKey
```

Returns the wallet's public key.

#### getAddress()

```typescript
getAddress(): string
```

Returns the wallet address as a base58 string.

#### getPrivateKey()

```typescript
getPrivateKey(): string
```

Returns the private key as a base58 string. **Use with caution!**

#### signMessage()

```typescript
async signMessage(message: Uint8Array): Promise<Uint8Array>
```

Signs a message with the wallet's private key.

#### signTransaction()

```typescript
async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>
```

Signs a transaction.

#### getSolBalance()

```typescript
async getSolBalance(): Promise<number>
```

Returns the SOL balance.

#### getTokenAccounts()

```typescript
async getTokenAccounts(): Promise<TokenBalance[]>
```

Returns all SPL token accounts.

#### getWalletState()

```typescript
async getWalletState(): Promise<WalletState>
```

Returns complete wallet state including SOL balance and tokens.

#### transferSol()

```typescript
async transferSol(to: string, amount: number, options?: SendOptions): Promise<TransactionSignature>
```

Transfers SOL to another address.

**Parameters:**
- `to`: Recipient address
- `amount`: Amount in SOL
- `options`: Optional send options

#### transferToken()

```typescript
async transferToken(
  to: string,
  mint: string,
  amount: number,
  decimals?: number
): Promise<TransactionSignature>
```

Transfers SPL tokens to another address.

**Parameters:**
- `to`: Recipient address
- `mint`: Token mint address
- `amount`: Amount to transfer
- `decimals`: Token decimals (default: 6)

#### requestAirdrop()

```typescript
async requestAirdrop(amount: number): Promise<TransactionSignature>
```

Requests SOL airdrop (devnet/testnet only).

#### executeDecision()

```typescript
async executeDecision(decision: AgentDecision): Promise<TransactionSignature | null>
```

Executes an agent decision.

### Static Methods

#### generate()

```typescript
static generate(config: WalletConfig): AgenticWallet
```

Generates a new wallet.

#### fromPrivateKey()

```typescript
static fromPrivateKey(privateKey: string, config: WalletConfig): AgenticWallet
```

Creates a wallet from a private key.

---

## AIAgent

Abstract base class for AI agents.

### Constructor

```typescript
constructor(wallet: AgenticWallet, config: AgentConfig)
```

### Abstract Methods

#### analyzeMarket()

```typescript
abstract analyzeMarket(tokenMint?: string): Promise<MarketData>
```

Analyzes market conditions and returns market data.

#### makeDecision()

```typescript
abstract makeDecision(walletState: WalletState, marketData?: MarketData): Promise<AgentDecision>
```

Makes a trading/operational decision based on market data.

### Methods

#### start()

```typescript
async start(intervalMs?: number): Promise<void>
```

Starts the agent's execution loop.

**Parameters:**
- `intervalMs`: Interval between cycles in milliseconds (default: 60000)

#### stop()

```typescript
stop(): void
```

Stops the agent.

#### getStatus()

```typescript
getStatus(): AgentStatus
```

Returns the agent's current status.

#### getDecisionLog()

```typescript
getDecisionLog(): DecisionLogEntry[]
```

Returns the decision history.

---

## TradingBot

AI agent for automated trading.

### Constructor

```typescript
constructor(
  wallet: AgenticWallet,
  config: AgentConfig,
  strategy: TradingStrategy
)
```

**Parameters:**
- `wallet`: AgenticWallet instance
- `config`: Agent configuration
- `strategy`: Trading strategy parameters

### TradingStrategy

```typescript
interface TradingStrategy {
  buyThreshold: number;      // Price drop % to trigger buy
  sellThreshold: number;     // Price rise % to trigger sell
  stopLoss: number;          // Stop loss percentage
  takeProfit: number;        // Take profit percentage
  maxPositionSize: number;   // Maximum position size in SOL
}
```

### Methods

#### getPositions()

```typescript
getPositions(): Position[]
```

Returns current trading positions.

#### getStats()

```typescript
getStats(): TradingStats
```

Returns trading statistics.

**Returns:**
```typescript
{
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageReturn: number;
}
```

---

## LiquidityProvider

AI agent for automated liquidity provision.

### Constructor

```typescript
constructor(
  wallet: AgenticWallet,
  config: AgentConfig,
  strategy: LPStrategy
)
```

### LPStrategy

```typescript
interface LPStrategy {
  minApy: number;              // Minimum APY to enter pool
  maxImpermanentLoss: number;  // Maximum acceptable IL
  targetPoolShare: number;     // Target share of pool
  rebalanceThreshold: number;  // Threshold to rebalance
  autoCompound: boolean;       // Auto-compound fees
}
```

### Methods

---

## Policy Registry

```typescript
class PolicyRegistry {
  apply(signedDocument: SignedPolicyDocument): PolicyHistoryEntry;
  rollback(version: number): PolicyHistoryEntry;
  getActivePolicy(): ActionPolicy | null;
  getHistory(): PolicyHistoryEntry[];
}
```

Helpers:

```typescript
signPolicyDocument(document: PolicyDocument, privateKeyBase58: string): SignedPolicyDocument
verifySignedPolicyDocument(document: SignedPolicyDocument): PolicyDocument
```

---

## Audit

```typescript
interface AuditSink {
  write(event: AuditEvent): Promise<AuditRecord>;
  list(limit?: number): Promise<AuditRecord[]>;
}
```

Default in-memory implementation:

```typescript
class InMemoryAuditSink implements AuditSink {}
verifyAuditChain(records: AuditRecord[]): boolean
```

---

## Execution Guard

```typescript
interface ExecutionGuard {
  assertAllowed(context: string): void;
  getState(): ExecutionGuardState;
}
```

Default implementation:

```typescript
class InMemoryExecutionGuard implements ExecutionGuard {
  pause(reason?: string): void;
  resume(): void;
}
```

---

## Market Data

```typescript
fetchSolMarketSnapshot(): Promise<{
  source: 'jupiter+coingecko' | 'coingecko-only';
  priceUsd: number;
  priceChange24h: number;
  volume24hUsd: number;
  estimatedLiquidityUsd: number;
  timestamp: number;
}>
```

---

## Telemetry

```typescript
telemetry.increment(name: string, amount?: number): void
telemetry.observe(name: string, value: number): void
telemetry.event(entry: TelemetryEvent): void
telemetry.getCounters(): Array<{ name: string; value: number }>
telemetry.getHistogramSummary(): Array<{ name: string; count: number; p50: number; p95: number }>
```

#### getPools()

```typescript
getPools(): LiquidityPool[]
```

Returns available liquidity pools.

#### getActivePositions()

```typescript
getActivePositions(): LPPosition[]
```

Returns active liquidity positions.

#### addLiquidity()

```typescript
async addLiquidity(poolId: string, amountA: number, amountB: number): Promise<void>
```

Adds liquidity to a pool.

#### removeLiquidity()

```typescript
async removeLiquidity(positionId: string, percentage: number): Promise<void>
```

Removes liquidity from a position.

#### getStats()

```typescript
getStats(): LPStats
```

Returns liquidity provision statistics.

---

## Types

### WalletConfig

```typescript
interface WalletConfig {
  network: 'devnet' | 'mainnet-beta' | 'testnet';
  rpcUrl?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}
```

### AgentConfig

```typescript
interface AgentConfig {
  name: string;
  description: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  maxTransactionAmount: number;
  cooldownPeriod: number;
  allowedActions: string[];
  blacklistedTokens: string[];
  whitelistedTokens?: string[];
}
```

### AgentDecision

```typescript
interface AgentDecision {
  action: 'transfer' | 'swap' | 'stake' | 'unstake' | 'provide_liquidity' | 'remove_liquidity' | 'hold';
  params: Record<string, any>;
  confidence: number;
  reason: string;
}
```

### MarketData

```typescript
interface MarketData {
  price: number;
  volume24h: number;
  priceChange24h: number;
  liquidity?: number;
}
```

### WalletState

```typescript
interface WalletState {
  address: string;
  solBalance: number;
  tokens: TokenBalance[];
  lastUpdated: Date;
}
```

### TokenBalance

```typescript
interface TokenBalance {
  mint: string;
  symbol: string;
  balance: number;
  decimals: number;
  usdValue?: number;
}
```
