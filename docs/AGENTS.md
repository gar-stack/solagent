# Agent Development Guide

This document explains how to build custom agents on top of SolAgent's base abstractions.

## Core Abstractions

- `AgenticWallet`: wallet state, signing, and execution primitives
- `AIAgent`: abstract lifecycle and risk-validation framework

## Base Contract

To create a custom agent, extend `AIAgent` and implement:

1. `analyzeMarket(tokenMint?)`
2. `makeDecision(walletState, marketData?)`

## Lifecycle

`start(intervalMs)` executes this loop:

1. Fetch wallet state
2. Analyze market
3. Produce decision
4. Validate decision via `shouldExecuteDecision`
5. Execute with `wallet.executeDecision`
6. Log decision and execution outcome

## Decision Shape

A decision includes:

- `action`
- `params`
- `confidence`
- `reason`

Current wallet executor supports:

- `transfer`
- `hold`

Other actions are intentionally placeholders in this prototype.

## Safety Controls

Configure these in `AgentConfig`:

- `maxTransactionAmount`
- `cooldownPeriod`
- `allowedActions`
- `blacklistedTokens`
- `whitelistedTokens` (optional)

## Example Skeleton

```ts
import { AIAgent, type AgentConfig, type MarketData } from '../src/sdk/AIAgent';
import { type AgentDecision, type WalletState } from '../src/sdk/AgenticWallet';

export class MyAgent extends AIAgent {
  constructor(wallet: import('../src/sdk/AgenticWallet').AgenticWallet, config: AgentConfig) {
    super(wallet, config);
  }

  async analyzeMarket(): Promise<MarketData> {
    return {
      price: 0,
      volume24h: 0,
      priceChange24h: 0,
    };
  }

  async makeDecision(_walletState: WalletState, _marketData?: MarketData): Promise<AgentDecision> {
    return {
      action: 'hold',
      params: {},
      confidence: 1,
      reason: 'No signal',
    };
  }
}
```
