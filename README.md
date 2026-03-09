# SolAgent

Agentic Wallets for AI Agents on Solana.

[![Solana](https://img.shields.io/badge/Solana-Devnet-purple)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

SolAgent is a challenge prototype for building autonomous AI agents that can create wallets, sign transactions, and execute selected actions on Solana.

## Challenge Submission

Submission target: DeFi Developer Challenge - Agentic Wallets for AI Agents
https://superteam.fun/earn/listing/defi-developer-challenge-agentic-wallets-for-ai-agents

## Implemented Scope

- Programmatic wallet creation (Ed25519 keypairs)
- Message and transaction signing
- SOL transfer
- SPL token transfer
- Devnet/testnet airdrop support
- Agent framework with risk checks (confidence threshold, allowed actions, cooldown, token lists)
- Trading bot and LP bot prototypes (decision logic currently mock/simulated)
- Route-based web app (`/`, `/dashboard`, `/docs`) with protected dashboard access
- Signed policy lifecycle with versioned apply/rollback support
- Append-only audit log chain with integrity verification
- Global emergency kill-switch for managed CLI execution paths

## Important Status Notes

- Web dashboard route requires connected master wallet (Phantom) before access.
- Dashboard navigation is blocked with visible toast feedback when wallet is not connected.
- Web dashboard no longer accepts CLI auth token/code input.
- CLI/SDK workflows remain available for users who prefer non-web operation.
- The dashboard now reads live devnet balances, recent signatures, and network stats via RPC.
- Trading and liquidity strategies currently use simulated market data.
- `executeDecision` currently executes `transfer` and `hold`; other action types are placeholders.
- CLI is packaged as a local binary at `dist-cli/solagent.cjs` via `npm run build:cli`.
- CLI default wallet storage supports encrypted-at-rest config via `SOLAGENT_MASTER_PASSWORD`.
- CLI exposes `policy:*`, `audit:*`, and `control:*` commands for control-plane operations.
- Initial unit tests are available for policy and CLI auth verification.

## Quick Start

```bash
git clone https://github.com/gar-stack/solagent.git
cd solagent
npm install
npm run dev
```

## Build and Validation

```bash
npm run lint
npm run test:unit
npm run build
npm run build:cli
npm test
```

## CLI Binary Usage

```bash
# Build the CLI binary
npm run build:cli

# Run directly
node dist-cli/solagent.cjs --help

# Optional: install local binary in your shell
npm link
solagent --help

# Control plane
solagent control:status
solagent control:pause --reason "manual stop"
solagent control:resume

# Policy lifecycle
solagent policy:apply --file ./policy.json
solagent policy:show
solagent policy:rollback --version 1

# Audit trail
solagent audit:tail --limit 20
solagent audit:verify
```

## SDK Example

```ts
import { AgenticWallet } from './src/sdk';

const wallet = AgenticWallet.generate({
  network: 'devnet',
  commitment: 'confirmed',
});

console.log('Wallet address:', wallet.getAddress());

await wallet.requestAirdrop(1);
const balance = await wallet.getSolBalance();
console.log('Balance:', balance, 'SOL');
```

## Project Structure

```text
solagent/
├── src/
│   ├── sdk/                       # Core wallet + agent abstractions
│   ├── agents/                    # Trading and liquidity bot implementations
│   ├── cli/                       # CLI source
│   ├── features/dashboard/        # Dashboard UI domain
│   ├── features/marketing/        # Landing/docs/footer sections
│   ├── features/navigation/       # Top navigation
│   ├── contexts/                  # Shared master-wallet state
│   ├── pages/                     # Route-level pages
│   ├── lib/                       # RPC and shared utilities
│   └── components/ui/             # UI component library
├── docs/
├── README.md
├── SKILLS.md
└── package.json
```

## Documentation

- [Getting Started](docs/GETTING_STARTED.md)
- [API Reference](docs/API_REFERENCE.md)
- [Security Guide](docs/SECURITY.md)
- [Agent Development](docs/AGENTS.md)
- [Deep Dive](docs/DEEP_DIVE.md)

## Security

Do not use this prototype with high-value production funds.

- Never commit private keys or `.solagent.json`.
- Use a dedicated low-balance devnet wallet for testing.
- Use strict `allowedActions`, `maxTransactionAmount`, and token lists.

## License

MIT - see [LICENSE](LICENSE).
