import { AIAgent, type AgentConfig, type MarketData } from '../sdk/AIAgent';
import { type AgentDecision, type WalletState } from '../sdk/AgenticWallet';
import { fetchSolMarketSnapshot } from '../lib/marketData';

export interface LiquidityPool {
  id: string;
  tokenA: string;
  tokenB: string;
  apy: number;
  tvl: number;
  volume24h: number;
  impermanentLoss24h: number;
  feeTier: number;
}

export interface LPStrategy {
  minApy: number;
  maxImpermanentLoss: number;
  targetPoolShare: number;
  rebalanceThreshold: number;
  autoCompound: boolean;
}

export class LiquidityProvider extends AIAgent {
  private pools: Map<string, LiquidityPool> = new Map();
  private activePositions: Map<string, {
    poolId: string;
    tokenAAmount: number;
    tokenBAmount: number;
    entryTimestamp: number;
    feesEarned: number;
  }> = new Map();
  private strategy: LPStrategy;

  constructor(
    wallet: import('../sdk/AgenticWallet').AgenticWallet,
    config: AgentConfig,
    strategy: LPStrategy
  ) {
    super(wallet, config);
    this.strategy = strategy;
    this.initializeMockPools();
  }

  // Initialize mock liquidity pools
  private initializeMockPools(): void {
    const mockPools: LiquidityPool[] = [
      {
        id: 'SOL-USDC-001',
        tokenA: 'SOL',
        tokenB: 'USDC',
        apy: 12.5,
        tvl: 5000000,
        volume24h: 2500000,
        impermanentLoss24h: 0.02,
        feeTier: 0.003,
      },
      {
        id: 'SOL-USDT-002',
        tokenA: 'SOL',
        tokenB: 'USDT',
        apy: 11.8,
        tvl: 4200000,
        volume24h: 2100000,
        impermanentLoss24h: 0.018,
        feeTier: 0.003,
      },
      {
        id: 'USDC-USDT-003',
        tokenA: 'USDC',
        tokenB: 'USDT',
        apy: 4.2,
        tvl: 15000000,
        volume24h: 8000000,
        impermanentLoss24h: 0.001,
        feeTier: 0.0005,
      },
      {
        id: 'BONK-SOL-004',
        tokenA: 'BONK',
        tokenB: 'SOL',
        apy: 45.2,
        tvl: 800000,
        volume24h: 1200000,
        impermanentLoss24h: 0.08,
        feeTier: 0.01,
      },
    ];

    mockPools.forEach(pool => {
      this.pools.set(pool.id, pool);
    });
  }

  // Analyze liquidity pool
  async analyzeMarket(_poolId?: string): Promise<MarketData> {
    const snapshot = await fetchSolMarketSnapshot();
    const volatility = Math.min(Math.abs(snapshot.priceChange24h) / 100, 0.2);
    const volumeFactor = snapshot.volume24hUsd > 0 ? Math.min(snapshot.volume24hUsd / 5_000_000_000, 2) : 1;

    // Update pool metrics from market conditions rather than randomness.
    this.pools.forEach(pool => {
      const apyChange = (pool.volume24h / pool.tvl) * 2 * volumeFactor - volatility;
      pool.apy = Math.max(0, pool.apy + apyChange);

      pool.volume24h = Math.max(0, pool.volume24h * (1 + (volumeFactor - 1) * 0.05));

      const ilChange = volatility * 0.1;
      pool.impermanentLoss24h = Math.max(0, pool.impermanentLoss24h + ilChange);
    });

    // Return aggregate market data
    const totalTvl = Array.from(this.pools.values()).reduce((sum, p) => sum + p.tvl, 0);
    const avgApy = Array.from(this.pools.values()).reduce((sum, p) => sum + p.apy, 0) / this.pools.size;

    return {
      price: snapshot.priceUsd || avgApy,
      volume24h: snapshot.volume24hUsd || totalTvl,
      priceChange24h: snapshot.priceChange24h,
      liquidity: totalTvl,
    };
  }

  // Make liquidity provision decision
  async makeDecision(walletState: WalletState, _marketData?: MarketData): Promise<AgentDecision> {
    const solBalance = walletState.solBalance;
    
    // Find best pool based on strategy
    const eligiblePools = Array.from(this.pools.values()).filter(pool => {
      return pool.apy >= this.strategy.minApy && 
             pool.impermanentLoss24h <= this.strategy.maxImpermanentLoss;
    });

    if (eligiblePools.length === 0) {
      return {
        action: 'hold',
        params: {},
        confidence: 0.5,
        reason: 'No eligible pools meet strategy criteria',
      };
    }

    // Sort by risk-adjusted return (APY / IL)
    eligiblePools.sort((a, b) => {
      const scoreA = a.apy / (a.impermanentLoss24h + 0.001);
      const scoreB = b.apy / (b.impermanentLoss24h + 0.001);
      return scoreB - scoreA;
    });

    const bestPool = eligiblePools[0];
    const existingPosition = Array.from(this.activePositions.values())
      .find(p => p.poolId === bestPool.id);

    // Decision logic
    let action: AgentDecision['action'] = 'hold';
    let confidence = 0.5;
    let reason = 'Evaluating opportunities';
    let params: Record<string, any> = {};

    // Enter new position
    if (!existingPosition && solBalance > 0.5) {
      const positionSize = Math.min(
        solBalance * this.strategy.targetPoolShare,
        solBalance * 0.3 // Max 30% of balance per position
      );

      action = 'provide_liquidity';
      confidence = this.calculatePoolConfidence(bestPool);
      reason = `High APY opportunity: ${bestPool.apy.toFixed(2)}% APY with ${bestPool.impermanentLoss24h.toFixed(4)}% IL`;
      params = {
        poolId: bestPool.id,
        tokenA: bestPool.tokenA,
        tokenB: bestPool.tokenB,
        amountA: positionSize / 2,
        amountB: positionSize / 2,
      };
    }
    // Rebalance existing position
    else if (existingPosition) {
      const pool = this.pools.get(existingPosition.poolId)!;
      const positionAge = Date.now() - existingPosition.entryTimestamp;
      const positionAgeDays = positionAge / (1000 * 60 * 60 * 24);

      // Check if we should rebalance
      const currentApy = pool.apy;
      const betterPool = eligiblePools.find(p => p.id !== pool.id && p.apy > currentApy * 1.2);

      if (betterPool && positionAgeDays > 1) {
        action = 'remove_liquidity';
        confidence = 0.7;
        reason = `Rebalancing to better opportunity: ${betterPool.apy.toFixed(2)}% vs ${currentApy.toFixed(2)}%`;
        params = {
          poolId: existingPosition.poolId,
          percentage: 100, // Remove all
        };
      }
      // Auto-compound fees
      else if (this.strategy.autoCompound && existingPosition.feesEarned > 0.01) {
        action = 'provide_liquidity';
        confidence = 0.8;
        reason = `Auto-compounding ${existingPosition.feesEarned.toFixed(4)} SOL in fees`;
        params = {
          poolId: existingPosition.poolId,
          tokenA: pool.tokenA,
          tokenB: pool.tokenB,
          amountA: existingPosition.feesEarned / 2,
          amountB: existingPosition.feesEarned / 2,
        };
      }
    }

    return {
      action,
      params,
      confidence,
      reason,
    };
  }

  // Calculate confidence score for a pool
  private calculatePoolConfidence(pool: LiquidityPool): number {
    let score = 0.5;

    // APY factor
    if (pool.apy > 20) score += 0.2;
    else if (pool.apy > 10) score += 0.1;

    // IL factor
    if (pool.impermanentLoss24h < 0.01) score += 0.15;
    else if (pool.impermanentLoss24h < 0.03) score += 0.05;

    // TVL factor (higher TVL = more stable)
    if (pool.tvl > 10000000) score += 0.1;
    else if (pool.tvl > 1000000) score += 0.05;

    // Volume factor
    const volumeToTvlRatio = pool.volume24h / pool.tvl;
    if (volumeToTvlRatio > 0.5) score += 0.1;

    return Math.min(0.95, score);
  }

  // Get available pools
  getPools(): LiquidityPool[] {
    return Array.from(this.pools.values());
  }

  // Get active positions
  getActivePositions(): Array<{
    poolId: string;
    pool: LiquidityPool;
    tokenAAmount: number;
    tokenBAmount: number;
    entryTimestamp: number;
    feesEarned: number;
    age: number;
  }> {
    return Array.from(this.activePositions.entries()).map(([, position]) => ({
      poolId: position.poolId,
      pool: this.pools.get(position.poolId)!,
      tokenAAmount: position.tokenAAmount,
      tokenBAmount: position.tokenBAmount,
      entryTimestamp: position.entryTimestamp,
      feesEarned: position.feesEarned,
      age: Date.now() - position.entryTimestamp,
    }));
  }

  // Simulate adding liquidity (mock implementation)
  async addLiquidity(
    poolId: string,
    amountA: number,
    amountB: number
  ): Promise<void> {
    const pool = this.pools.get(poolId);
    if (!pool) throw new Error('Pool not found');

    const position = {
      poolId,
      tokenAAmount: amountA,
      tokenBAmount: amountB,
      entryTimestamp: Date.now(),
      feesEarned: 0,
    };

    this.activePositions.set(`${poolId}-${Date.now()}`, position);
    console.log(`Added liquidity to ${poolId}: ${amountA} ${pool.tokenA} + ${amountB} ${pool.tokenB}`);
  }

  // Simulate removing liquidity (mock implementation)
  async removeLiquidity(positionId: string, percentage: number): Promise<void> {
    const position = this.activePositions.get(positionId);
    if (!position) throw new Error('Position not found');

    const pool = this.pools.get(position.poolId)!;
    const removedA = position.tokenAAmount * (percentage / 100);
    const removedB = position.tokenBAmount * (percentage / 100);

    if (percentage >= 100) {
      this.activePositions.delete(positionId);
    } else {
      position.tokenAAmount -= removedA;
      position.tokenBAmount -= removedB;
    }

    console.log(`Removed ${percentage}% liquidity from ${position.poolId}: ${removedA} ${pool.tokenA} + ${removedB} ${pool.tokenB}`);
  }

  // Get LP statistics
  getStats(): {
    totalPositions: number;
    totalValueLocked: number;
    totalFeesEarned: number;
    averageApy: number;
    bestPerformingPool: string | null;
  } {
    const positions = Array.from(this.activePositions.values());
    const totalValueLocked = positions.reduce((sum, p) => sum + p.tokenAAmount + p.tokenBAmount, 0);
    const totalFeesEarned = positions.reduce((sum, p) => sum + p.feesEarned, 0);
    
    const poolApys = positions.map(p => this.pools.get(p.poolId)?.apy || 0);
    const averageApy = poolApys.length > 0 ? poolApys.reduce((a, b) => a + b, 0) / poolApys.length : 0;

    // Find best performing pool
    let bestPool: string | null = null;
    let bestReturn = 0;
    
    positions.forEach(p => {
      const pool = this.pools.get(p.poolId);
      if (pool && p.feesEarned > bestReturn) {
        bestReturn = p.feesEarned;
        bestPool = p.poolId;
      }
    });

    return {
      totalPositions: positions.length,
      totalValueLocked,
      totalFeesEarned,
      averageApy,
      bestPerformingPool: bestPool,
    };
  }
}

export default LiquidityProvider;
