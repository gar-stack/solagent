<div align="center">
  <img src="https://github.com/user-attachments/assets/placeholder-solagent-logo.png" width="120" height="120" alt="SolAgent Logo" />
  <h1>SolAgent</h1>
  <p><b>Autonomous Wallet Infrastructure for AI Agents on Solana</b></p>
  
  [![Solana](https://img.shields.io/badge/Solana-Devnet-14F195?style=for-the-badge&logo=solana&logoColor=black)](https://solana.com)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
  [![Framework](https://img.shields.io/badge/LangGraph-Agentic-blue?style=for-the-badge&labelColor=6b4fbb)](https://langchain-ai.github.io/langgraphjs/)
</div>

---

## 🚀 Overview

**SolAgent** is the first lightweight infrastructure designed specifically for **autonomous AI agents** on the Solana blockchain. It provides a robust abstraction layer between your agentic brain (LLM) and the raw blockchain, allowing agents to:

- 🛡️ **Own and Control Wallets**: Programmatically create and manage unique identities.
- 🧠 **Self-Correcting Decisions**: Uses **LangGraph** to ensure agents follow rules and fix their own errors.
- 💸 **Autonomous Finance**: Sign transactions, manage SOL balances, and simulate DeFi interactions without human approval.
- 📊 **Real-time Observability**: A premium dashboard monitors "agent thoughts" and transactions as they happen.

---

## 🏗️ Core Architecture (The PDA Loop)

SolAgent follows the **Perception-Decision-Action** loop, ensuring agents act like real-world independent actors:

1. **Perceive**: Agent checks its current wallet balance and previous transaction history.
2. **Decide**: The AI brain (LLM) chooses an action (Transfer, Swap, Hold) based on its current context.
3. **Act**: The internal **KMS (Key Management System)** signs and broadcasts the transaction safely to Devnet.

---

## ✨ Features

- **Multi-Model Support**: Use any LLM—from local **Ollama** (Llama 3) to **Hugging Face** Inferences or **Groq**.
- **Agent Sandbox**: Run multiple agents in parallel, each with their own recurring schedules and unique strategies.
- **Persistent Memory**: Agents remember their last actions and balances even after you restart the system.
- **KMS Abstraction**: Keys are stored securely in an isolated layer, ready to be swapped with AWS KMS or HashiCorp Vault.
- **Real-time Dashboard**: A beautiful React frontend using **Framer Motion** and **Glassmorphism** to visualize the agent swarm.

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Ollama](https://ollama.ai/) (Optional, for 100% local free AI)
- A Solana Devnet environment

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/solagent.git
cd solagent

# Install dependencies
npm install

# Configure your environment
cp .env.example .env
# Add your GROQ_API_KEY or HUGGINGFACEHUB_API_TOKEN
```

### Run the Swarm

```bash
# Start the AI Simulation & Dashboard API
npm start

# In a separate terminal, start the Web UI
cd frontend
npm run dev
```

Visit `http://localhost:5173` to watch your agents evolve!

---

## 🛡️ Security

SolAgent prioritizes security through its **KMS Layer**:

- Private keys reside in `keyManager.ts` and are never exposed to the LLM or frontend.
- Uses standard `@solana/web3.js` for non-custodial signing.
- **Production Roadmap**: Integration with hardware security modules (HSM) and multi-sig (Squads) planned for Phase 2.

---

## 📊 Evaluation & Tracing

This project integrated **Opik** for full decision-tracing. You can monitor every prompt, thought, and JSON output of your agents in the Opik dashboard to debug agent behavior and optimize prompts.

---

## 🏆 Bounty Submission

Built for the **Superteam Nigeria: Agentic Wallets for AI Agents** challenge.
Designed to show that AI on Solana is no longer just a script—it's a living ecosystem of autonomous finance.
