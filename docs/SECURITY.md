# Security Guide

This document covers current security controls and limitations in SolAgent.

## Current Security Controls

- Local keypair generation using Solana `Keypair.generate()`
- Local signing for messages and transactions
- Encrypted-at-rest default CLI wallet storage via `SOLAGENT_MASTER_PASSWORD`
- Agent-level decision gating:
  - confidence threshold
  - allowed action list
  - max transaction amount
  - cooldown period
  - token blacklist/whitelist
- Signed policy lifecycle (versioned updates + rollback)
- Append-only audit hash chain with verification support
- Emergency kill-switch for managed CLI execution paths

## Known Limitations

- No external KMS/HSM integration yet (local encryption only)
- If using legacy config storage, private keys may still exist in plaintext `.solagent.json`
- No multisig / MPC / HSM integration
- No hardware-wallet integration
- No explicit anti-MEV transaction routing

## Recommended Usage for This Prototype

1. Use devnet wallets for testing.
2. Do not store high-value keys in local config files.
3. Keep wallet balances low during experiments.
4. Restrict actions to `transfer` and `hold` unless you implement other executors.
5. Use strict token whitelist and low transaction limits.

## Production Hardening Checklist

- [ ] Replace local encryption with managed secrets (KMS/HSM)
- [ ] Add multi-signer policy approvals and operator RBAC
- [ ] Stream audit records to external immutable storage/SIEM
- [ ] Add robust monitoring and alerting
- [ ] Expand integration tests for full executor flows
- [ ] Implement distributed kill-switch propagation for multi-host deployments
