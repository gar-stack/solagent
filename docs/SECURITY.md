# Security Guide

This document covers current security controls and limitations in SolAgent.

## Current Security Controls

- Local keypair generation using Solana `Keypair.generate()`
- Local signing for messages and transactions
- Agent-level decision gating:
  - confidence threshold
  - allowed action list
  - max transaction amount
  - cooldown period
  - token blacklist/whitelist
- Decision and transaction history tracking in memory

## Known Limitations

- No encrypted key vault implementation in this repo
- If using CLI config storage, private keys may exist in plaintext `.solagent.json`
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

- [ ] Replace plaintext secret handling with secure key management
- [ ] Add encrypted-at-rest wallet material handling
- [ ] Add policy enforcement and approval workflows
- [ ] Add robust monitoring and alerting
- [ ] Add test coverage for execution and guardrails
- [ ] Add incident response and emergency stop procedures

