import { Keypair } from "@solana/web3.js";
import { createWallet } from "../wallet/walletFactory";
import { airdropSOL } from "../wallet/airdrop";
import { sendSOL } from "../wallet/signer";
import { getAllWallets } from "../wallet/walletRegistry";
import { agentBus } from "../utils/eventBus";
import { perceive } from "../agents/perception";
import { decide } from "../agents/decisionEngine";
import { executeAction } from "../agents/executor";
import { getKey } from "../wallet/keyManager";
import { loadJSON, saveJSON } from "../utils/storage";
import { connection } from "../utils/connection";

const DEFAULT_INTERVAL_MS = 5000;

// Runs a single agent cycle: perceive → decide → act → emit
async function runAgentCycle(agent: any, targetAddress: string, agentId: string) {
    try {
        console.log(`\n[Agent ${agentId}] --- Cycle Start ---`);

        const keypair = getKey(agent.id);
        if (!keypair) throw new Error(`Keypair missing in KMS for agent ${agent.id}`);

        // Phase 1: Perceive
        const snapshot = await perceive(keypair.publicKey, agentId);

        // Phase 2: Decide
        const action = await decide(snapshot, targetAddress);

        // Phase 3: Act
        await executeAction(keypair, action, agentId);
    } catch (error: any) {
        console.log(`[Agent ${agentId}] Error during cycle: ${error.message}`);
    }

    agentBus.emit("cycle_completed", { agentId, timestamp: Date.now() });
}

// Schedules an agent to run its cycle on a recurring interval.
// Returns a stop() function that clears the interval.
export function scheduleAgent(
    agent: any,
    targetAddress: string,
    agentId: string,
    intervalMs: number = DEFAULT_INTERVAL_MS
): { stop: () => void } {
    console.log(`[Scheduler] Agent ${agentId} scheduled every ${intervalMs}ms`);

    // Run the first cycle immediately
    runAgentCycle(agent, targetAddress, agentId);

    const handle = setInterval(() => {
        runAgentCycle(agent, targetAddress, agentId);
    }, intervalMs);

    return {
        stop: () => {
            clearInterval(handle);
            console.log(`[Scheduler] Agent ${agentId} stopped.`);
        }
    };
}

// Main entry: fund agents, schedule them, listen for events
export async function startSimulation() {
    // --- Master wallet funding ---
    console.log("[Funding] Loading master funding wallet...");
    const MASTER_FILE = "master.json";
    const masterData = loadJSON<number[] | null>(MASTER_FILE, null);

    let masterWallet: Keypair;
    if (masterData) {
        masterWallet = Keypair.fromSecretKey(Uint8Array.from(masterData));
        console.log(`[Funding] Loaded existing master wallet: ${masterWallet.publicKey.toBase58()}`);
    } else {
        masterWallet = Keypair.generate();
        saveJSON(MASTER_FILE, Array.from(masterWallet.secretKey));
        console.log(`[Funding] Generated new master wallet: ${masterWallet.publicKey.toBase58()}`);
    }

    // Always attempt a small airdrop to top up if needed, but master check balance would be better.
    // For now, let's just check balance first.
    const balance = await connection.getBalance(masterWallet.publicKey);
    if (balance < 500000000) { // Less than 0.5 SOL
        try {
            console.log(`[Funding] Requesting devnet airdrop to master wallet...`);
            await airdropSOL(masterWallet.publicKey);
        } catch (e: any) {
            console.log(`[Funding] Master Airdrop failed: ${e.message}`);
        }
    }

    // --- Create/Load agents ---
    let agents = getAllWallets();
    if (agents.length === 0) {
        console.log("[Scheduler] No existing agents found. Creating new ones...");
        createWallet();
        createWallet();
        createWallet();
        agents = getAllWallets();
    } else {
        console.log(`[Scheduler] Loaded ${agents.length} existing agents from persistence.`);
    }

    console.log(`\n[Scheduler] ${agents.length} agents registered.\n`);

    // --- Distribute funds ---
    console.log("[Funding] Distributing SOL from master wallet to agents...");
    for (let i = 0; i < agents.length; i++) {
        try {
            console.log(`[Funding] Sending 0.6 SOL to Agent ${i + 1} (${agents[i].address})`);
            await sendSOL(masterWallet, agents[i].address, 600000000);
        } catch (e: any) {
            console.log(`[Funding] Distribution to Agent ${i + 1} failed: ${e.message}`);
        }
    }

    console.log("\n[Scheduler] Funding complete. Scheduling agent cycles...\n");

    // --- Schedule each agent as an independent task ---
    const handles = agents.map((agent, index) => {
        const targetIndex = (index + 1) % agents.length;
        return scheduleAgent(agent, agents[targetIndex].address, agent.id, DEFAULT_INTERVAL_MS);
    });

    // Keep the process alive; return handles so callers could stop agents if needed
    return handles;
}
