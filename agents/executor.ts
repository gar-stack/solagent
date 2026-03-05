import { Keypair } from "@solana/web3.js";
import { CAPABILITIES } from "./capabilities";
import { AgentAction } from "./decisionEngine";
import { updateMemory, getMemory } from "./memory";
import { agentBus } from "../utils/eventBus";

// Executes a structured AgentAction by routing to the matching capability,
// then updates agent memory with the results.
export async function executeAction(
    keypair: Keypair,
    action: AgentAction,
    agentId: number
): Promise<void> {
    const capability = CAPABILITIES[action.type];
    if (!capability) {
        console.log(`  [Execute] Unknown action type: ${action.type}`);
        return;
    }

    const targetAddress = action.params.to || "";

    console.log(`  [Execute] Running capability: ${capability.name}`);
    await capability.execute(keypair, targetAddress);

    // --- Update memory ---
    const memory = getMemory(agentId);

    memory.lastAction = action.type;
    memory.cycleCount += 1;

    if (action.type === "transfer") {
        memory.recentTransactions.push({
            to: action.params.to,
            amount: action.params.amount,
            timestamp: Date.now(),
        });
        // Keep only the last 10 transactions
        if (memory.recentTransactions.length > 10) {
            memory.recentTransactions = memory.recentTransactions.slice(-10);
        }
    }

    updateMemory(agentId, memory);
}
