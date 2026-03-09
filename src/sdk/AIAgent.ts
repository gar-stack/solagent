import { AgenticWallet, type AgentDecision, type WalletState } from './AgenticWallet';

export interface AgentConfig {
  name: string;
  description: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  maxTransactionAmount: number;
  cooldownPeriod: number;
  allowedActions: string[];
  blacklistedTokens: string[];
  whitelistedTokens?: string[];
}

export interface MarketData {
  price: number;
  volume24h: number;
  priceChange24h: number;
  liquidity?: number;
}

export abstract class AIAgent {
  protected wallet: AgenticWallet;
  protected config: AgentConfig;
  protected isRunning: boolean = false;
  protected lastActionTime: number = 0;
  protected decisionLog: Array<{
    timestamp: Date;
    decision: AgentDecision;
    executed: boolean;
    signature?: string;
  }> = [];

  constructor(wallet: AgenticWallet, config: AgentConfig) {
    this.wallet = wallet;
    this.config = config;
  }

  // Abstract method for analyzing market conditions
  abstract analyzeMarket(tokenMint?: string): Promise<MarketData>;

  // Abstract method for making decisions
  abstract makeDecision(walletState: WalletState, marketData?: MarketData): Promise<AgentDecision>;

  // Get agent name
  getName(): string {
    return this.config.name;
  }

  // Get agent config
  getConfig(): AgentConfig {
    return this.config;
  }

  // Check if agent is running
  isActive(): boolean {
    return this.isRunning;
  }

  // Start the agent
  async start(intervalMs: number = 60000): Promise<void> {
    if (this.isRunning) {
      console.log(`Agent ${this.config.name} is already running`);
      return;
    }

    this.isRunning = true;
    console.log(`Starting agent: ${this.config.name}`);
    console.log(`Description: ${this.config.description}`);
    console.log(`Risk Level: ${this.config.riskLevel}`);
    console.log(`Wallet Address: ${this.wallet.getAddress()}`);

    // Initial run
    await this.runCycle();

    // Schedule periodic execution
    const intervalId = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(intervalId);
        return;
      }
      await this.runCycle();
    }, intervalMs);
  }

  // Stop the agent
  stop(): void {
    this.isRunning = false;
    console.log(`Stopping agent: ${this.config.name}`);
  }

  // Main execution cycle
  protected async runCycle(): Promise<void> {
    try {
      // Check cooldown
      const now = Date.now();
      if (now - this.lastActionTime < this.config.cooldownPeriod) {
        return;
      }

      // Get wallet state
      const walletState = await this.wallet.getWalletState();

      // Analyze market
      const marketData = await this.analyzeMarket();

      // Make decision
      const decision = await this.makeDecision(walletState, marketData);

      // Log decision
      this.decisionLog.push({
        timestamp: new Date(),
        decision,
        executed: false,
      });

      // Execute decision if appropriate
      if (this.shouldExecuteDecision(decision)) {
        const signature = await this.wallet.executeDecision(decision);
        
        if (signature) {
          this.lastActionTime = Date.now();
          this.decisionLog[this.decisionLog.length - 1].executed = true;
          this.decisionLog[this.decisionLog.length - 1].signature = signature;
          
          console.log(`Executed ${decision.action}: ${signature}`);
        }
      }
    } catch (error) {
      console.error(`Error in agent cycle: ${error}`);
    }
  }

  // Determine if decision should be executed
  protected shouldExecuteDecision(decision: AgentDecision): boolean {
    // Check confidence threshold
    if (decision.confidence < 0.6) {
      return false;
    }

    // Check if action is allowed
    if (!this.config.allowedActions.includes(decision.action)) {
      return false;
    }

    // Check amount limits
    if (decision.params.amount > this.config.maxTransactionAmount) {
      console.log('Transaction amount exceeds maximum allowed');
      return false;
    }

    // Check token blacklist
    if (decision.params.token && this.config.blacklistedTokens.includes(decision.params.token)) {
      console.log('Token is blacklisted');
      return false;
    }

    // Check token whitelist (if defined)
    if (this.config.whitelistedTokens && decision.params.token) {
      if (!this.config.whitelistedTokens.includes(decision.params.token)) {
        console.log('Token is not in whitelist');
        return false;
      }
    }

    return true;
  }

  // Get decision log
  getDecisionLog(): Array<{
    timestamp: Date;
    decision: AgentDecision;
    executed: boolean;
    signature?: string;
  }> {
    return this.decisionLog;
  }

  // Get agent status
  getStatus(): {
    name: string;
    isRunning: boolean;
    walletAddress: string;
    lastActionTime: number;
    totalDecisions: number;
    executedDecisions: number;
  } {
    return {
      name: this.config.name,
      isRunning: this.isRunning,
      walletAddress: this.wallet.getAddress(),
      lastActionTime: this.lastActionTime,
      totalDecisions: this.decisionLog.length,
      executedDecisions: this.decisionLog.filter(d => d.executed).length,
    };
  }
}

export default AIAgent;
