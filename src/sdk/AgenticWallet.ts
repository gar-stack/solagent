import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  type SendOptions,
  type TransactionSignature,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  TokenAccountNotFoundError,
} from '@solana/spl-token';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import type { AuditSink } from './audit';
import type { ExecutionGuard } from './control';

export interface WalletConfig {
  network: 'devnet' | 'mainnet-beta' | 'testnet';
  rpcUrl?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  auditSink?: AuditSink;
  executionGuard?: ExecutionGuard;
}

export interface TransactionRequest {
  to: string;
  amount: number;
  token?: string;
  decimals?: number;
}

export interface AgentDecision {
  action: 'transfer' | 'swap' | 'stake' | 'unstake' | 'provide_liquidity' | 'remove_liquidity' | 'hold';
  params: Record<string, any>;
  confidence: number;
  reason: string;
}

export interface WalletState {
  address: string;
  solBalance: number;
  tokens: TokenBalance[];
  lastUpdated: Date;
}

export interface TokenBalance {
  mint: string;
  symbol: string;
  balance: number;
  decimals: number;
  usdValue?: number;
}

export class AgenticWallet {
  private keypair: Keypair;
  private connection: Connection;
  private config: WalletConfig;
  private transactionHistory: Array<{
    signature: string;
    timestamp: Date;
    type: string;
    status: 'success' | 'failed';
    details: any;
  }> = [];

  private readonly retryAttempts = 3;
  private readonly retryBaseDelayMs = 400;
  private readonly auditSink?: AuditSink;
  private readonly executionGuard?: ExecutionGuard;

  constructor(config: WalletConfig, privateKey?: string) {
    this.config = {
      commitment: 'confirmed',
      ...config,
    };

    // Initialize connection
    const endpoint = config.rpcUrl || this.getDefaultEndpoint(config.network);
    this.connection = new Connection(endpoint, this.config.commitment);
    this.auditSink = config.auditSink;
    this.executionGuard = config.executionGuard;

    // Initialize keypair
    if (privateKey) {
      const secretKey = bs58.decode(privateKey);
      this.keypair = Keypair.fromSecretKey(secretKey);
    } else {
      this.keypair = Keypair.generate();
    }
  }

  private getDefaultEndpoint(network: string): string {
    switch (network) {
      case 'devnet':
        return 'https://api.devnet.solana.com';
      case 'mainnet-beta':
        return 'https://api.mainnet-beta.solana.com';
      case 'testnet':
        return 'https://api.testnet.solana.com';
      default:
        return 'https://api.devnet.solana.com';
    }
  }

  // Get wallet public key
  getPublicKey(): PublicKey {
    return this.keypair.publicKey;
  }

  // Get wallet address
  getAddress(): string {
    return this.keypair.publicKey.toBase58();
  }

  // Get private key (encrypted storage recommended in production)
  getPrivateKey(): string {
    return bs58.encode(this.keypair.secretKey);
  }

  // Get connection instance
  getConnection(): Connection {
    return this.connection;
  }

  // Sign a message
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    return nacl.sign.detached(message, this.keypair.secretKey);
  }

  // Verify a signature
  verifyMessage(message: Uint8Array, signature: Uint8Array, publicKey?: PublicKey): boolean {
    const key = publicKey || this.keypair.publicKey;
    return nacl.sign.detached.verify(message, signature, key.toBytes());
  }

  // Sign a transaction
  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    if (transaction instanceof VersionedTransaction) {
      transaction.sign([this.keypair]);
      return transaction;
    } else {
      transaction.partialSign(this.keypair);
      return transaction;
    }
  }

  // Sign multiple transactions
  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    return Promise.all(transactions.map(tx => this.signTransaction(tx)));
  }

  // Get SOL balance
  async getSolBalance(): Promise<number> {
    const balance = await this.connection.getBalance(this.keypair.publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  // Get token accounts
  async getTokenAccounts(): Promise<TokenBalance[]> {
    const accounts = await this.connection.getParsedTokenAccountsByOwner(
      this.keypair.publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    return accounts.value.map(account => {
      const parsedInfo = account.account.data.parsed.info;
      return {
        mint: parsedInfo.mint,
        symbol: 'UNKNOWN',
        balance: parsedInfo.tokenAmount.uiAmount || 0,
        decimals: parsedInfo.tokenAmount.decimals,
      };
    });
  }

  // Get complete wallet state
  async getWalletState(): Promise<WalletState> {
    const [solBalance, tokens] = await Promise.all([
      this.getSolBalance(),
      this.getTokenAccounts(),
    ]);

    return {
      address: this.getAddress(),
      solBalance,
      tokens,
      lastUpdated: new Date(),
    };
  }

  // Transfer SOL
  async transferSol(to: string, amount: number, options?: SendOptions): Promise<TransactionSignature> {
    this.assertExecutionAllowed('wallet.transferSol');
    const toPublicKey = new PublicKey(to);
    const lamports = amount * LAMPORTS_PER_SOL;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.keypair.publicKey,
        toPubkey: toPublicKey,
        lamports,
      })
    );

    const signature = await this.simulateAndSendLegacyTransaction(transaction, options);
    
    this.transactionHistory.push({
      signature,
      timestamp: new Date(),
      type: 'SOL_TRANSFER',
      status: 'success',
      details: { to, amount },
    });
    await this.auditSink?.write({
      category: 'wallet',
      action: 'transfer-sol',
      level: 'info',
      actor: this.getAddress(),
      target: to,
      message: 'SOL transfer confirmed',
      metadata: { amount, signature },
    });

    return signature;
  }

  // Transfer SPL tokens
  async transferToken(
    to: string,
    mint: string,
    amount: number,
    decimals: number = 6
  ): Promise<TransactionSignature> {
    this.assertExecutionAllowed('wallet.transferToken');
    const toPublicKey = new PublicKey(to);
    const mintPublicKey = new PublicKey(mint);
    const tokenAmount = amount * Math.pow(10, decimals);

    const fromTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      this.keypair.publicKey
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      toPublicKey
    );

    const transaction = new Transaction();

    // Check if recipient token account exists
    try {
      await getAccount(this.connection, toTokenAccount);
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            this.keypair.publicKey,
            toTokenAccount,
            toPublicKey,
            mintPublicKey
          )
        );
      }
    }

    transaction.add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        this.keypair.publicKey,
        tokenAmount
      )
    );

    const signature = await this.simulateAndSendLegacyTransaction(transaction);

    this.transactionHistory.push({
      signature,
      timestamp: new Date(),
      type: 'TOKEN_TRANSFER',
      status: 'success',
      details: { to, mint, amount },
    });
    await this.auditSink?.write({
      category: 'wallet',
      action: 'transfer-token',
      level: 'info',
      actor: this.getAddress(),
      target: to,
      message: 'SPL token transfer confirmed',
      metadata: { mint, amount, decimals, signature },
    });

    return signature;
  }

  // Request airdrop (devnet only)
  async requestAirdrop(amount: number = 1): Promise<TransactionSignature> {
    this.assertExecutionAllowed('wallet.requestAirdrop');
    if (this.config.network !== 'devnet' && this.config.network !== 'testnet') {
      throw new Error('Airdrop is only available on devnet or testnet');
    }

    const lamports = amount * LAMPORTS_PER_SOL;
    const signature = await this.withRetry(async () => {
      const sig = await this.connection.requestAirdrop(this.keypair.publicKey, lamports);
      await this.confirmTransaction(sig);
      return sig;
    });

    return signature;
  }

  // Confirm transaction
  private async confirmTransaction(
    signature: string,
    latestBlockhash?: { blockhash: string; lastValidBlockHeight: number }
  ): Promise<void> {
    const blockhashCtx = latestBlockhash ?? (await this.connection.getLatestBlockhash());
    await this.connection.confirmTransaction(
      {
        signature,
        blockhash: blockhashCtx.blockhash,
        lastValidBlockHeight: blockhashCtx.lastValidBlockHeight,
      },
      this.config.commitment
    );
  }

  private async simulateAndSendLegacyTransaction(transaction: Transaction, options?: SendOptions): Promise<TransactionSignature> {
    return this.withRetry(async () => {
      const latestBlockhash = await this.connection.getLatestBlockhash(this.config.commitment);
      transaction.feePayer = this.keypair.publicKey;
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.sign(this.keypair);

      const simulation = await this.connection.simulateTransaction(transaction, [this.keypair], true);
      if (simulation.value.err) {
        throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }

      const signature = await this.connection.sendTransaction(transaction, [this.keypair], options);
      await this.confirmTransaction(signature, latestBlockhash);
      return signature;
    });
  }

  private async withRetry<T>(operation: () => Promise<T>, attempts: number = this.retryAttempts): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt >= attempts) break;
        const delay = this.retryBaseDelayMs * attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Operation failed after retries');
  }

  // Get transaction history
  getTransactionHistory(): Array<{
    signature: string;
    timestamp: Date;
    type: string;
    status: 'success' | 'failed';
    details: any;
  }> {
    return this.transactionHistory;
  }

  // Execute agent decision
  async executeDecision(decision: AgentDecision): Promise<TransactionSignature | null> {
    this.assertExecutionAllowed('wallet.executeDecision');
    if (decision.confidence < 0.5) {
      console.log('Decision confidence too low, skipping execution');
      await this.auditSink?.write({
        category: 'execution',
        action: decision.action,
        level: 'warn',
        actor: this.getAddress(),
        message: 'Decision skipped due to low confidence',
        metadata: { confidence: decision.confidence, decision },
      });
      return null;
    }

    switch (decision.action) {
      case 'transfer':
        if (decision.params.token) {
          return this.transferToken(
            decision.params.to,
            decision.params.token,
            decision.params.amount,
            decision.params.decimals
          );
        } else {
          return this.transferSol(decision.params.to, decision.params.amount);
        }
      case 'hold':
        console.log('Holding position as per agent decision');
        await this.auditSink?.write({
          category: 'execution',
          action: 'hold',
          level: 'info',
          actor: this.getAddress(),
          message: 'Hold decision acknowledged',
          metadata: { decision },
        });
        return null;
      default:
        console.log(`Action ${decision.action} not yet implemented`);
        await this.auditSink?.write({
          category: 'execution',
          action: decision.action,
          level: 'warn',
          actor: this.getAddress(),
          message: 'Decision action is not implemented',
          metadata: { decision },
        });
        return null;
    }
  }

  private assertExecutionAllowed(context: string): void {
    this.executionGuard?.assertAllowed(context);
  }

  // Static method to create wallet from mnemonic (simplified)
  static fromPrivateKey(privateKey: string, config: WalletConfig): AgenticWallet {
    return new AgenticWallet(config, privateKey);
  }

  // Static method to generate new wallet
  static generate(config: WalletConfig): AgenticWallet {
    return new AgenticWallet(config);
  }
}

export default AgenticWallet;
