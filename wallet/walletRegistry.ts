import { saveJSON, loadJSON } from "../utils/storage";

const REGISTRY_FILE = "registry.json";

// Load registry on startup
export const registry: any[] = loadJSON<any[]>(REGISTRY_FILE, []);

export function registerWallet(wallet: any): void {
    registry.push(wallet);
    saveJSON(REGISTRY_FILE, registry);
    console.log(`[Registry] Registered wallet: ${wallet.address}`);
}

export function getAllWallets(): any[] {
    return registry;
}

export function getWalletByAddress(address: string): any | undefined {
    return registry.find(w => w.address === address);
}

