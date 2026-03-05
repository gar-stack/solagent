# SolAgent Security Design

SolAgent separates AI logic from wallet signing.

Components:
- Agent Engine
- Wallet Manager
- Signer Module

Security considerations:
- Private keys stored in isolated wallet module
- Signer handles all transactions

Future improvements:
- Hardware wallets
- Vault key management
- Multisig approvals
