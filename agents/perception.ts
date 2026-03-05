import { PublicKey } from "@solana/web3.js";
import { connection } from "../utils/connection";
import { getAllWallets } from "../wallet/walletRegistry";
import { getMemory, AgentMemory } from "./memory";

export interface Perception {
    balance: number;
    knownAgents: string[];
    memory: AgentMemory;
}

// Gathers a snapshot of the agent's world for the decision engine.
export async function perceive(publicKey: PublicKey, agentId: number): Promise<Perception> {
    const balance = await connection.getBalance(publicKey);
    const knownAgents = getAllWallets().map((w) => w.address);
    const memory = getMemory(agentId);

    // Store the fetched balance so the dashboard memory reader can display it
    memory.lastBalance = balance;

    console.log(`  [Perceive] balance=${balance} knownAgents=${knownAgents.length} cycles=${memory.cycleCount}`);

    return { balance, knownAgents, memory };
}
