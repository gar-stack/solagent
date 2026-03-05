import { saveJSON, loadJSON } from "../utils/storage";

// Lightweight in-memory state for each agent, keyed by agentId.

export interface TransactionRecord {
    to: string;
    amount: number;
    timestamp: number;
}

export interface AgentMemory {
    lastAction: string | null;
    lastBalance: number;
    recentTransactions: TransactionRecord[];
    cycleCount: number;
}

const MEMORY_FILE = "memory.json";

// Load memory on startup
const rawData = loadJSON<Record<string, AgentMemory>>(MEMORY_FILE, {});
const store = new Map<string, AgentMemory>();
for (const [key, mem] of Object.entries(rawData)) {
    store.set(key, mem);
}

function createDefaultMemory(): AgentMemory {
    return {
        lastAction: null,
        lastBalance: 0,
        recentTransactions: [],
        cycleCount: 0,
    };
}

function persistMemory() {
    const dataToSave: Record<string, AgentMemory> = {};
    for (const [id, mem] of store.entries()) {
        dataToSave[id] = mem;
    }
    saveJSON(MEMORY_FILE, dataToSave);
}

export function getMemory(agentId: string): AgentMemory {
    if (!store.has(agentId)) {
        store.set(agentId, createDefaultMemory());
        persistMemory();
    }
    return store.get(agentId)!;
}

export function updateMemory(agentId: string, patch: Partial<AgentMemory>): void {
    const current = getMemory(agentId);
    Object.assign(current, patch);
    persistMemory();
}

