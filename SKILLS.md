# SolAgent: AI Skills Registry

This document defines the core capabilities available to AI agents via the SolAgent wallet infrastructure. Agents can use these skills to interact with the Solana blockchain autonomously.

### 1. Account Management

- **Skill**: `create_wallet`
- **Description**: Programmatically generate a new Solana Keypair and register it with the SolAgent KMS (Key Management System).
- **Security**: Private keys are abstracted and stored in an isolated layer, never exposed to the agent logic.

### 2. Transaction Execution

- **Skill**: `sign_transaction`
- **Description**: Automatically sign transactions from the agent's wallet without manual approval.
- **Safety**: Supports transaction pre-flight simulation to prevent burning fees on failing TXs.

### 3. Native Asset Transfer

- **Skill**: `transfer_sol`
- **Description**: Transfer native SOL between agent wallets or to external third-party addresses.
- **Parameters**: `recipient_address`, `amount_in_lamports`.

### 4. Self-Sourced Funding

- **Skill**: `request_airdrop`
- **Description**: Autonomously request Devnet SOL from the official faucet when balance is low (< 0.1 SOL).
- **Rate-Limiting**: Integrated delay to respect faucet limits.

### 5. DeFi Interaction (Simulated)

- **Skill**: `execute_swap`
- **Description**: Execute token swaps on decentralized exchanges. (Currently simulated on Devnet by sending to a known liquidity pool constant).
- **Ecosystem**: Ready for Jupiter API or OpenBook integration.

### 6. Observability

- **Skill**: `emit_telemetry`
- **Description**: Stream "thoughts", decisions, and execution logs to the SolAgent Dashboard in real-time via WebSockets.
- **Tracing**: Fully integrated with Opik for LLM decision tracing.
