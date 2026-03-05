import { PublicKey } from "@solana/web3.js";
import { connection } from "../utils/connection";
import { getAllWallets } from "../wallet/walletRegistry";
import { getMemory, AgentMemory } from "./memory";

export interface Perception {
    balance: number;
    tokenAccountCount: number;
    knownAgents: string[];
    memory: AgentMemory;
}

// Gathers a snapshot of the agent's world for the decision engine.
export async function perceive(publicKey: PublicKey, agentId: string): Promise<Perception> {
    const balance = await connection.getBalance(publicKey);

    // Check for any SPL token accounts (awareness)
    let tokenAccountCount = 0;
    try {
        const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
            programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        });
        tokenAccountCount = tokenAccounts.value.length;
    } catch (e) {
        // Ignore or log error
    }

    const knownAgents = getAllWallets().map((w) => w.address);
    const memory = getMemory(agentId);

    // Store the fetched balance so the dashboard memory reader can display it
    memory.lastBalance = balance;

    console.log(`  [Perceive] balance=${balance} tokens=${tokenAccountCount} agents=${knownAgents.length}`);

    return { balance, tokenAccountCount, knownAgents, memory };
}

