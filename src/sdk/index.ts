// SolAgent SDK - Agentic Wallets for AI Agents on Solana

export { AgenticWallet } from './AgenticWallet';
export type {
  WalletConfig,
  TransactionRequest,
  AgentDecision,
  WalletState,
  TokenBalance,
} from './AgenticWallet';

export { AIAgent } from './AIAgent';
export type {
  AgentConfig,
  MarketData,
} from './AIAgent';

// Re-export agents
export { TradingBot, type TradingStrategy } from '../agents/TradingBot';
export { LiquidityProvider, type LiquidityPool, type LPStrategy } from '../agents/LiquidityProvider';

// Version
export const VERSION = '1.0.0';
export const SDK_NAME = 'SolAgent';
