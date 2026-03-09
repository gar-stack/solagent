# Security Guide

This document outlines the security features and best practices for using SolAgent.

## Security Features

### 1. Key Management

#### Secure Key Generation
- Uses cryptographically secure random number generation
- 256-bit Ed25519 key pairs
- Compliant with Solana standards

#### Key Storage
```typescript
// NEVER hardcode private keys in production
const wallet = AgenticWallet.generate({ network: 'devnet' });
const privateKey = wallet.getPrivateKey();

// Store securely (e.g., environment variables, key management service)
// process.env.PRIVATE_KEY
```

### 2. Transaction Safety

#### Transaction Limits
```typescript
const agent = new TradingBot(wallet, {
  // ... other config
  maxTransactionAmount: 1.0, // Max 1 SOL per transaction
  cooldownPeriod: 300000,    // 5 minutes between actions
});
```

#### Action Whitelisting
```typescript
const config = {
  allowedActions: ['transfer', 'swap', 'hold'],
  // 'stake', 'unstake', 'provide_liquidity' are NOT allowed
};
```

#### Token Controls
```typescript
const config = {
  blacklistedTokens: [
    'KNOWN_SCAM_TOKEN_MINT',
    'SUSPICIOUS_TOKEN_MINT'
  ],
  whitelistedTokens: [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  ]
};
```

### 3. Risk Management

#### Risk Levels
```typescript
type RiskLevel = 'conservative' | 'moderate' | 'aggressive';

const config = {
  riskLevel: 'conservative', // Stricter limits, more safety checks
};
```

#### Confidence Thresholds
```typescript
// Decisions with confidence < 0.6 are not executed
const decision = {
  action: 'transfer',
  params: { to: '...', amount: 0.5 },
  confidence: 0.75, // Must be >= 0.6 to execute
  reason: 'Strong buy signal'
};
```

### 4. Audit Trail

All actions are logged:

```typescript
// Decision log
{
  timestamp: Date;
  decision: AgentDecision;
  executed: boolean;
  signature?: string; // Transaction signature if executed
}

// Access via
const log = agent.getDecisionLog();
```

## Best Practices

### 1. Environment Variables

Never commit private keys to version control:

```typescript
// .env
SOLANA_NETWORK=devnet
PRIVATE_KEY=your_base58_encoded_private_key
MAX_TRANSACTION_AMOUNT=1.0

// Load in code
import dotenv from 'dotenv';
dotenv.config();

const wallet = AgenticWallet.fromPrivateKey(
  process.env.PRIVATE_KEY!,
  { network: process.env.SOLANA_NETWORK as any }
);
```

### 2. Network Selection

```typescript
// Development - use devnet
const devWallet = AgenticWallet.generate({ network: 'devnet' });

// Production - use mainnet-beta
const prodWallet = AgenticWallet.fromPrivateKey(privateKey, {
  network: 'mainnet-beta',
  rpcUrl: 'https://your-custom-rpc.com' // Use private RPC for production
});
```

### 3. Rate Limiting

```typescript
const config = {
  cooldownPeriod: 60000, // Minimum 1 minute between actions
};
```

### 4. Monitoring

```typescript
// Check agent status regularly
const status = agent.getStatus();
console.log('Total decisions:', status.totalDecisions);
console.log('Executed:', status.executedDecisions);

// Monitor for unusual activity
if (status.executedDecisions > 100) {
  console.warn('High activity detected - review strategy');
}
```

### 5. Emergency Stop

```typescript
// Implement emergency stop
let emergencyStop = false;

// In your agent
async makeDecision(walletState, marketData) {
  if (emergencyStop) {
    return {
      action: 'hold',
      params: {},
      confidence: 1.0,
      reason: 'Emergency stop activated'
    };
  }
  // ... normal decision logic
}

// Trigger emergency stop
emergencyStop = true;
agent.stop();
```

## Common Attack Vectors

### 1. Private Key Exposure

**Risk**: Private keys exposed in logs or error messages

**Mitigation**:
```typescript
// NEVER do this
console.log('Private key:', wallet.getPrivateKey());

// Safe logging
console.log('Public address:', wallet.getAddress());
```

### 2. Unauthorized Transactions

**Risk**: Agent makes unintended transactions

**Mitigation**:
- Use `allowedActions` to restrict capabilities
- Set `maxTransactionAmount` limits
- Implement `cooldownPeriod`
- Review decision logs regularly

### 3. Malicious Tokens

**Risk**: Trading scam or malicious tokens

**Mitigation**:
- Maintain `blacklistedTokens` list
- Use `whitelistedTokens` for strict control
- Verify token contracts before trading

### 4. Front-Running

**Risk**: Transactions front-run by MEV bots

**Mitigation**:
- Use private RPC endpoints
- Implement slippage protection
- Consider using Jito or similar services

## Production Checklist

Before deploying to production:

- [ ] Use mainnet-beta network
- [ ] Configure private RPC endpoint
- [ ] Set appropriate transaction limits
- [ ] Define allowed actions whitelist
- [ ] Configure token blacklists
- [ ] Implement monitoring and alerting
- [ ] Set up emergency stop mechanism
- [ ] Review and test all strategies
- [ ] Enable comprehensive logging
- [ ] Document all configurations

---

**Remember**: Security is an ongoing process. Regularly review and update your security practices.
