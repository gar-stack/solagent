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

export interface WalletConfig {
  network: 'devnet' | 'mainnet-beta' | 'testnet';
  rpcUrl?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
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

  constructor(config: WalletConfig, privateKey?: string) {
    this.config = {
      commitment: 'confirmed',
      ...config,
    };

    // Initialize connection
    const endpoint = config.rpcUrl || this.getDefaultEndpoint(config.network);
    this.connection = new Connection(endpoint, this.config.commitment);

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
    const toPublicKey = new PublicKey(to);
    const lamports = amount * LAMPORTS_PER_SOL;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.keypair.publicKey,
        toPubkey: toPublicKey,
        lamports,
      })
    );

    const signature = await this.connection.sendTransaction(transaction, [this.keypair], options);
    
    await this.confirmTransaction(signature);
    
    this.transactionHistory.push({
      signature,
      timestamp: new Date(),
      type: 'SOL_TRANSFER',
      status: 'success',
      details: { to, amount },
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

    const signature = await this.connection.sendTransaction(transaction, [this.keypair]);
    await this.confirmTransaction(signature);

    this.transactionHistory.push({
      signature,
      timestamp: new Date(),
      type: 'TOKEN_TRANSFER',
      status: 'success',
      details: { to, mint, amount },
    });

    return signature;
  }

  // Request airdrop (devnet only)
  async requestAirdrop(amount: number = 1): Promise<TransactionSignature> {
    if (this.config.network !== 'devnet' && this.config.network !== 'testnet') {
      throw new Error('Airdrop is only available on devnet or testnet');
    }

    const lamports = amount * LAMPORTS_PER_SOL;
    const signature = await this.connection.requestAirdrop(this.keypair.publicKey, lamports);
    await this.confirmTransaction(signature);

    return signature;
  }

  // Confirm transaction
  private async confirmTransaction(signature: string): Promise<void> {
    const latestBlockhash = await this.connection.getLatestBlockhash();
    await this.connection.confirmTransaction(
      {
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      this.config.commitment
    );
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
    if (decision.confidence < 0.5) {
      console.log('Decision confidence too low, skipping execution');
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
        return null;
      default:
        console.log(`Action ${decision.action} not yet implemented`);
        return null;
    }
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
