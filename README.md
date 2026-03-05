# SolAgent

Autonomous Wallet Infrastructure for AI Agents on Solana.

## Overview

SolAgent enables AI agents to autonomously create wallets,
manage funds, and execute transactions on Solana.

## Features

- Programmatic wallet creation
- Autonomous transaction signing
- Devnet SOL management
- Multi-agent simulation

## Architecture

AI Agent → Wallet Manager → Signer → Solana Devnet

## Quick Start

Install dependencies

npm install

Run simulation

npx ts-node scripts/start.ts

## Demo

The simulator creates three agents, each controlling a wallet
that can sign transactions and interact with Solana devnet.
