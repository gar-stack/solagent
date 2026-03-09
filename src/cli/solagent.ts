#!/usr/bin/env node

import { Command } from 'commander';
import { AgenticWallet, TradingBot, LiquidityProvider } from '../sdk';
import * as fs from 'fs';
import * as path from 'path';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { createCliAuthCode, type CliAuthPayload } from '../lib/cliAuth';

const program = new Command();

interface Config {
  network: 'devnet' | 'mainnet-beta' | 'testnet';
  rpcUrl?: string;
  defaultWallet?: string;
  encryptedDefaultWallet?: string;
}

const CONFIG_PATH = path.join(process.cwd(), '.solagent.json');

function encryptSecret(secret: string, passphrase: string): string {
  const iv = randomBytes(12);
  const salt = randomBytes(16);
  const key = scryptSync(passphrase, salt, 32);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    v: 1,
    alg: 'aes-256-gcm',
    iv: iv.toString('base64'),
    salt: salt.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  });
}

function decryptSecret(payload: string, passphrase: string): string {
  const parsed = JSON.parse(payload) as {
    iv: string;
    salt: string;
    tag: string;
    data: string;
  };
  const iv = Buffer.from(parsed.iv, 'base64');
  const salt = Buffer.from(parsed.salt, 'base64');
  const tag = Buffer.from(parsed.tag, 'base64');
  const data = Buffer.from(parsed.data, 'base64');
  const key = scryptSync(passphrase, salt, 32);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}

function resolvePrivateKey(flagKey: string | undefined, config: Config): string | undefined {
  if (flagKey) return flagKey;

  if (config.encryptedDefaultWallet) {
    const passphrase = process.env.SOLAGENT_MASTER_PASSWORD;
    if (!passphrase) {
      throw new Error('Encrypted wallet configured. Set SOLAGENT_MASTER_PASSWORD to unlock it.');
    }
    return decryptSecret(config.encryptedDefaultWallet, passphrase);
  }

  if (config.defaultWallet) {
    console.warn('⚠️ Using plaintext default wallet from config. Migrate by re-saving wallet with SOLAGENT_MASTER_PASSWORD set.');
    return config.defaultWallet;
  }

  return undefined;
}

function loadConfig(): Config {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  }
  return { network: 'devnet' };
}

function saveConfig(config: Config): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

program
  .name('solagent')
  .description('SolAgent CLI - Manage AI agent wallets on Solana')
  .version('1.0.0');

// Wallet commands
program
  .command('wallet:create')
  .description('Create a new agentic wallet')
  .option('-n, --network <network>', 'Network (devnet/mainnet-beta/testnet)', 'devnet')
  .option('-s, --save', 'Save as default wallet', false)
  .action(async (options) => {
    console.log('🔐 Creating new wallet...');
    
    const wallet = AgenticWallet.generate({
      network: options.network,
    });

    console.log('\n✅ Wallet created successfully!');
    console.log(`📍 Address: ${wallet.getAddress()}`);
    console.log(`🔑 Private Key: ${wallet.getPrivateKey()}`);
    console.log(`🌐 Network: ${options.network}`);

    if (options.save) {
      const config = loadConfig();
      const passphrase = process.env.SOLAGENT_MASTER_PASSWORD;
      if (!passphrase) {
        console.error('❌ Set SOLAGENT_MASTER_PASSWORD before using --save to store encrypted wallet credentials.');
        process.exit(1);
      }

      config.encryptedDefaultWallet = encryptSecret(wallet.getPrivateKey(), passphrase);
      delete config.defaultWallet;
      config.network = options.network;
      saveConfig(config);
      console.log('\n💾 Wallet encrypted and saved as default');
    }

    console.log('\n⚠️  IMPORTANT: Save your private key securely. It cannot be recovered!');
  });

program
  .command('wallet:balance')
  .description('Check wallet balance')
  .option('-k, --key <key>', 'Private key (or use default)')
  .action(async (options) => {
    const config = loadConfig();
    const privateKey = resolvePrivateKey(options.key, config);

    if (!privateKey) {
      console.error('❌ No private key provided. Use --key or set a default wallet.');
      process.exit(1);
    }

    const wallet = AgenticWallet.fromPrivateKey(privateKey, {
      network: config.network,
    });

    console.log(`📍 Address: ${wallet.getAddress()}`);
    console.log('⏳ Fetching balance...');

    try {
      const balance = await wallet.getSolBalance();
      const tokens = await wallet.getTokenAccounts();

      console.log(`\n💰 SOL Balance: ${balance.toFixed(4)} SOL`);
      
      if (tokens.length > 0) {
        console.log('\n🪙 Token Balances:');
        tokens.forEach(token => {
          console.log(`  • ${token.mint}: ${token.balance}`);
        });
      }
    } catch (error) {
      console.error('❌ Error fetching balance:', error);
    }
  });

program
  .command('wallet:airdrop')
  .description('Request SOL airdrop (devnet only)')
  .option('-k, --key <key>', 'Private key (or use default)')
  .option('-a, --amount <amount>', 'Amount in SOL', '1')
  .action(async (options) => {
    const config = loadConfig();
    const privateKey = resolvePrivateKey(options.key, config);

    if (!privateKey) {
      console.error('❌ No private key provided. Use --key or set a default wallet.');
      process.exit(1);
    }

    const wallet = AgenticWallet.fromPrivateKey(privateKey, {
      network: config.network,
    });

    console.log(`📍 Address: ${wallet.getAddress()}`);
    console.log(`⏳ Requesting ${options.amount} SOL airdrop...`);

    try {
      const signature = await wallet.requestAirdrop(parseFloat(options.amount));
      console.log(`✅ Airdrop successful!`);
      console.log(`🔗 Signature: ${signature}`);
    } catch (error) {
      console.error('❌ Airdrop failed:', error);
    }
  });

program
  .command('wallet:transfer')
  .description('Transfer SOL to another address')
  .option('-k, --key <key>', 'Private key (or use default)')
  .requiredOption('-t, --to <address>', 'Recipient address')
  .requiredOption('-a, --amount <amount>', 'Amount in SOL')
  .action(async (options) => {
    const config = loadConfig();
    const privateKey = resolvePrivateKey(options.key, config);

    if (!privateKey) {
      console.error('❌ No private key provided. Use --key or set a default wallet.');
      process.exit(1);
    }

    const wallet = AgenticWallet.fromPrivateKey(privateKey, {
      network: config.network,
    });

    console.log(`📍 From: ${wallet.getAddress()}`);
    console.log(`📍 To: ${options.to}`);
    console.log(`💰 Amount: ${options.amount} SOL`);
    console.log('⏳ Sending transaction...');

    try {
      const signature = await wallet.transferSol(options.to, parseFloat(options.amount));
      console.log(`✅ Transfer successful!`);
      console.log(`🔗 Signature: ${signature}`);
    } catch (error) {
      console.error('❌ Transfer failed:', error);
    }
  });

// Agent commands
program
  .command('agent:trading')
  .description('Start a trading bot agent')
  .option('-k, --key <key>', 'Private key (or use default)')
  .option('-n, --name <name>', 'Agent name', 'Trading Bot')
  .option('-r, --risk <level>', 'Risk level (conservative/moderate/aggressive)', 'moderate')
  .option('-i, --interval <ms>', 'Check interval in milliseconds', '60000')
  .action(async (options) => {
    const config = loadConfig();
    const privateKey = resolvePrivateKey(options.key, config);

    if (!privateKey) {
      console.error('❌ No private key provided. Use --key or set a default wallet.');
      process.exit(1);
    }

    const wallet = AgenticWallet.fromPrivateKey(privateKey, {
      network: config.network,
    });

    const bot = new TradingBot(
      wallet,
      {
        name: options.name,
        description: 'Automated trading bot',
        riskLevel: options.risk,
        maxTransactionAmount: 1.0,
        cooldownPeriod: 300000,
        allowedActions: ['transfer', 'swap', 'hold'],
        blacklistedTokens: [],
      },
      {
        buyThreshold: -2,
        sellThreshold: 5,
        stopLoss: 3,
        takeProfit: 10,
        maxPositionSize: 0.5,
      }
    );

    console.log(`🤖 Starting ${options.name}...`);
    console.log(`📍 Wallet: ${wallet.getAddress()}`);
    console.log(`⚙️  Risk Level: ${options.risk}`);
    console.log(`⏱️  Interval: ${options.interval}ms`);
    console.log('\nPress Ctrl+C to stop\n');

    await bot.start(parseInt(options.interval));
  });

program
  .command('agent:liquidity')
  .description('Start a liquidity provider agent')
  .option('-k, --key <key>', 'Private key (or use default)')
  .option('-n, --name <name>', 'Agent name', 'LP Bot')
  .option('-m, --min-apy <apy>', 'Minimum APY threshold', '5')
  .option('-i, --interval <ms>', 'Check interval in milliseconds', '300000')
  .action(async (options) => {
    const config = loadConfig();
    const privateKey = resolvePrivateKey(options.key, config);

    if (!privateKey) {
      console.error('❌ No private key provided. Use --key or set a default wallet.');
      process.exit(1);
    }

    const wallet = AgenticWallet.fromPrivateKey(privateKey, {
      network: config.network,
    });

    const lp = new LiquidityProvider(
      wallet,
      {
        name: options.name,
        description: 'Automated liquidity provider',
        riskLevel: 'moderate',
        maxTransactionAmount: 2.0,
        cooldownPeriod: 600000,
        allowedActions: ['provide_liquidity', 'remove_liquidity', 'hold'],
        blacklistedTokens: [],
      },
      {
        minApy: parseFloat(options.minApy),
        maxImpermanentLoss: 0.05,
        targetPoolShare: 0.1,
        rebalanceThreshold: 0.2,
        autoCompound: true,
      }
    );

    console.log(`🤖 Starting ${options.name}...`);
    console.log(`📍 Wallet: ${wallet.getAddress()}`);
    console.log(`📈 Min APY: ${options.minApy}%`);
    console.log(`⏱️  Interval: ${options.interval}ms`);
    console.log('\nPress Ctrl+C to stop\n');

    await lp.start(parseInt(options.interval));
  });

// Config commands
program
  .command('config:set')
  .description('Set configuration')
  .option('-n, --network <network>', 'Default network')
  .option('-r, --rpc <url>', 'Custom RPC URL')
  .action(async (options) => {
    const config = loadConfig();
    
    if (options.network) {
      config.network = options.network;
      console.log(`✅ Network set to: ${options.network}`);
    }
    
    if (options.rpc) {
      config.rpcUrl = options.rpc;
      console.log(`✅ RPC URL set to: ${options.rpc}`);
    }
    
    saveConfig(config);
  });

program
  .command('config:show')
  .description('Show current configuration')
  .action(() => {
    const config = loadConfig();
    console.log('⚙️  Current Configuration:');
    console.log(JSON.stringify(config, null, 2));
  });

program
  .command('auth:code')
  .description('Generate a signed dashboard access code from your default CLI wallet')
  .option('-k, --key <key>', 'Private key (or use default)')
  .option('-t, --ttl <seconds>', 'Code validity in seconds', '900')
  .action(async (options) => {
    try {
      const config = loadConfig();
      const privateKey = resolvePrivateKey(options.key, config);

      if (!privateKey) {
        console.error('❌ No private key provided. Use --key or set a default wallet.');
        process.exit(1);
      }

      const wallet = AgenticWallet.fromPrivateKey(privateKey, {
        network: config.network,
        rpcUrl: config.rpcUrl,
      });

      const ttlSeconds = Math.max(60, parseInt(options.ttl, 10) || 900);
      const now = Math.floor(Date.now() / 1000);
      const payload: CliAuthPayload = {
        ver: 1,
        kind: 'cli-auth',
        wallet: wallet.getAddress(),
        network: config.network,
        iat: now,
        exp: now + ttlSeconds,
      };

      const code = createCliAuthCode(privateKey, payload);

      console.log('✅ Dashboard access code generated');
      console.log(`⏱️  Expires in: ${ttlSeconds} seconds`);
      console.log('\nPaste this into the dashboard CLI Access field:\n');
      console.log(code);
    } catch (error) {
      console.error(`❌ Failed to generate auth code: ${error instanceof Error ? error.message : 'unknown error'}`);
      process.exit(1);
    }
  });

program.parse();
