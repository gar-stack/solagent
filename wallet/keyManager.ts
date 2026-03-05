import { Keypair } from "@solana/web3.js";
import { saveJSON, loadJSON } from "../utils/storage";

// In-memory Key Management System representation for hackathon simplicity.
// Abstracts away private key storage to be easily swappable with a real KMS provider.
const keyStore = new Map<string, Keypair>();

const KEYS_FILE = "keys.json";

// Load keys on startup
const storedKeys = loadJSON<Record<string, number[]>>(KEYS_FILE, {});
for (const [agentId, secretArray] of Object.entries(storedKeys)) {
    const secretKey = Uint8Array.from(secretArray);
    const keypair = Keypair.fromSecretKey(secretKey);
    keyStore.set(agentId, keypair);
}

export function storeKey(agentId: string, keypair: Keypair): void {
    keyStore.set(agentId, keypair);

    // Persist to disk
    const dataToSave: Record<string, number[]> = {};
    for (const [id, kp] of keyStore.entries()) {
        dataToSave[id] = Array.from(kp.secretKey);
    }
    saveJSON(KEYS_FILE, dataToSave);
}

export function getKey(agentId: string): Keypair | undefined {
    return keyStore.get(agentId);
}

