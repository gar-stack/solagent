# SolAgent

Agentic Wallets for AI Agents on Solana.

[![Solana](https://img.shields.io/badge/Solana-Devnet-purple)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Submission target:
https://superteam.fun/earn/listing/defi-developer-challenge-agentic-wallets-for-ai-agents

## What It Does

- SDK + CLI for agent wallets and controlled execution
- Web dashboard with master-wallet gate and RBAC (`viewer` / `operator` / `admin`)
- Multi-wallet web support (Phantom, Solflare, Backpack)
- Signed policy lifecycle + append-only audit chain + emergency kill-switch

## Architecture (Abstract)

1. **Control Plane**: policy, audit, kill-switch (`src/sdk`, `src/cli`)
2. **Execution Plane**: agent loop and wallet operations (`src/agents`, `src/sdk`)
3. **Presentation Plane**: routed web UI (`/`, `/dashboard`, `/docs`)

## Quick Start

```bash
git clone https://github.com/gar-stack/solagent.git
cd solagent
npm install
npm run dev
```

## Web Config

```bash
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_OPERATOR_WALLETS=<comma-separated-wallets>
VITE_ADMIN_WALLETS=<comma-separated-wallets>
VITE_APP_URL=https://your-project.vercel.app
```

## CLI Guide (Short)

```bash
npm run build:cli
node dist-cli/solagent.cjs --help

# wallet
node dist-cli/solagent.cjs wallet:create --network devnet --save
node dist-cli/solagent.cjs wallet:balance

# control plane
node dist-cli/solagent.cjs policy:show
node dist-cli/solagent.cjs control:status
node dist-cli/solagent.cjs audit:verify
```

Detailed CLI walkthrough:
- [Getting Started](docs/GETTING_STARTED.md)
- [API Reference](docs/API_REFERENCE.md)

## Deploy (Vercel GitHub Auto-Deploy)

1. Connect this GitHub repository to Vercel.
2. Configure env vars in Vercel project settings (`VITE_SOLANA_RPC_URL`, `VITE_OPERATOR_WALLETS`, `VITE_ADMIN_WALLETS`, `VITE_APP_URL`).
3. Push to `main` for production deployment.
4. Open preview deployments on pull requests for QA.

## Validation

```bash
npm run lint
npm run test:unit
npm run build
npm run build:cli
```

## Links

- [Live App (set via `VITE_APP_URL` in UI)](https://vercel.com/new)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Deep Dive](docs/DEEP_DIVE.md)
- [Security Guide](docs/SECURITY.md)
- [Contributing](docs/CONTRIBUTING.md)

## Security Note

Prototype only. Do not use high-value funds.
