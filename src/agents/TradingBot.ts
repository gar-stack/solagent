import { AIAgent, type AgentConfig, type MarketData } from '../sdk/AIAgent';
import { type AgentDecision, type WalletState } from '../sdk/AgenticWallet';

interface PriceHistory {
  timestamp: number;
  price: number;
}

export interface TradingStrategy {
  buyThreshold: number;
  sellThreshold: number;
  stopLoss: number;
  takeProfit: number;
  maxPositionSize: number;
}

export class TradingBot extends AIAgent {
  private priceHistory: Map<string, PriceHistory[]> = new Map();
  private positions: Map<string, {
    entryPrice: number;
    amount: number;
    timestamp: number;
  }> = new Map();
  private strategy: TradingStrategy;

  constructor(
    wallet: import('../sdk/AgenticWallet').AgenticWallet,
    config: AgentConfig,
    strategy: TradingStrategy
  ) {
    super(wallet, config);
    this.strategy = strategy;
  }

  // Simulate market analysis (in production, this would fetch real data)
  async analyzeMarket(tokenMint: string = 'SOL'): Promise<MarketData> {
    // Simulate fetching market data
    // In production, this would use Jupiter API, Birdeye, or similar
    const mockPrice = this.getMockPrice(tokenMint);
    const mockVolume = Math.random() * 1000000;
    const mockChange = (Math.random() - 0.5) * 10;

    // Store price history
    if (!this.priceHistory.has(tokenMint)) {
      this.priceHistory.set(tokenMint, []);
    }
    
    this.priceHistory.get(tokenMint)!.push({
      timestamp: Date.now(),
      price: mockPrice,
    });

    // Keep only last 100 prices
    const history = this.priceHistory.get(tokenMint)!;
    if (history.length > 100) {
      history.shift();
    }

    return {
      price: mockPrice,
      volume24h: mockVolume,
      priceChange24h: mockChange,
      liquidity: mockVolume * 0.1,
    };
  }

  // Mock price generator (replace with real price feed in production)
  private getMockPrice(tokenMint: string): number {
    const basePrices: Record<string, number> = {
      'SOL': 150,
      'USDC': 1,
      'USDT': 1,
      'BONK': 0.00001,
    };

    const basePrice = basePrices[tokenMint] || 1;
    const volatility = 0.02; // 2% volatility
    const change = (Math.random() - 0.5) * 2 * volatility;
    
    return basePrice * (1 + change);
  }

  // Calculate moving average
  private calculateMA(tokenMint: string, periods: number): number {
    const history = this.priceHistory.get(tokenMint);
    if (!history || history.length < periods) {
      return 0;
    }

    const recent = history.slice(-periods);
    const sum = recent.reduce((acc, h) => acc + h.price, 0);
    return sum / periods;
  }

  // Calculate RSI (Relative Strength Index)
  private calculateRSI(tokenMint: string, periods: number = 14): number {
    const history = this.priceHistory.get(tokenMint);
    if (!history || history.length < periods + 1) {
      return 50;
    }

    const recent = history.slice(-periods - 1);
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < recent.length; i++) {
      const change = recent[i].price - recent[i - 1].price;
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / periods;
    const avgLoss = losses / periods;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // Make trading decision
  async makeDecision(walletState: WalletState, marketData?: MarketData): Promise<AgentDecision> {
    const tokenMint = 'SOL';
    const currentPrice = marketData?.price || this.getMockPrice(tokenMint);
    const rsi = this.calculateRSI(tokenMint);
    const ma20 = this.calculateMA(tokenMint, 20);
    const ma50 = this.calculateMA(tokenMint, 50);

    const solBalance = walletState.solBalance;
    const position = this.positions.get(tokenMint);

    // Decision logic
    let action: AgentDecision['action'] = 'hold';
    let confidence = 0.5;
    let reason = 'No clear signal';
    let params: Record<string, any> = {};

    // Buy signal: RSI oversold + price above MA + golden cross
    if (rsi < 30 && currentPrice > ma20 && ma20 > ma50 && solBalance > 0.1) {
      action = 'transfer';
      confidence = 0.75;
      reason = `Oversold conditions (RSI: ${rsi.toFixed(2)}), bullish momentum detected`;
      
      const buyAmount = Math.min(
        solBalance * 0.1,
        this.strategy.maxPositionSize
      );

      params = {
        to: this.getMockDEXAddress(),
        amount: buyAmount,
        token: tokenMint,
      };
    }
    // Sell signal: RSI overbought + price below MA + death cross
    else if (rsi > 70 && currentPrice < ma20 && ma20 < ma50 && position) {
      const profitPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
      
      if (profitPercent >= this.strategy.takeProfit || profitPercent <= -this.strategy.stopLoss) {
        action = 'transfer';
        confidence = 0.8;
        reason = `Take profit or stop loss triggered (${profitPercent.toFixed(2)}% P&L)`;
        params = {
          to: this.wallet.getAddress(),
          amount: position.amount,
          token: tokenMint,
        };
      }
    }
    // Hold with confidence adjustment
    else {
      if (rsi > 50 && ma20 > ma50) {
        confidence = 0.6;
        reason = 'Bullish trend, holding position';
      } else if (rsi < 50 && ma20 < ma50) {
        confidence = 0.4;
        reason = 'Bearish trend, waiting for better entry';
      }
    }

    return {
      action,
      params,
      confidence,
      reason,
    };
  }

  // Mock DEX address for swaps
  private getMockDEXAddress(): string {
    return 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4';
  }

  // Get current positions
  getPositions(): Array<{
    token: string;
    entryPrice: number;
    currentPrice: number;
    amount: number;
    pnl: number;
  }> {
    return Array.from(this.positions.entries()).map(([token, position]) => {
      const currentPrice = this.getMockPrice(token);
      const pnl = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
      
      return {
        token,
        entryPrice: position.entryPrice,
        currentPrice,
        amount: position.amount,
        pnl,
      };
    });
  }

  // Get trading statistics
  getStats(): {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    averageReturn: number;
  } {
    const executed = this.getDecisionLog().filter(d => d.executed);
    const trades = executed.filter(d => d.decision.action === 'transfer');
    
    // Mock statistics (in production, calculate from actual trades)
    const winningTrades = Math.floor(trades.length * 0.6);
    const losingTrades = trades.length - winningTrades;
    
    return {
      totalTrades: trades.length,
      winningTrades,
      losingTrades,
      winRate: trades.length > 0 ? (winningTrades / trades.length) * 100 : 0,
      averageReturn: 2.5, // Mock average return per trade
    };
  }
}

export default TradingBot;
