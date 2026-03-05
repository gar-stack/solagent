import { Keypair, PublicKey } from "@solana/web3.js";
import { connection } from "../utils/connection";
import { sendSOL } from "../wallet/signer";
import { agentBus } from "../utils/eventBus";
import { airdropSOL } from "../wallet/airdrop";

// A capability is a named, executable async function
export interface Capability {
    name: string;
    execute: (keypair: Keypair, targetAddress: string) => Promise<void>;
}

// transfer: sends 0.01 SOL to the target agent
export const transferCapability: Capability = {
    name: "transfer",
    execute: async (keypair: Keypair, targetAddress: string) => {
        console.log(`  [transfer] Sending 10,000,000 lamports to ${targetAddress}`);
        await sendSOL(keypair, targetAddress, 10000000);
        agentBus.emit("transfer_executed", {
            from: keypair.publicKey.toBase58(),
            to: targetAddress,
            amount: 10000000
        });
    }
};

// check_balance: queries and logs the agent's current balance
export const checkBalanceCapability: Capability = {
    name: "check_balance",
    execute: async (keypair: Keypair, _targetAddress: string) => {
        const balance = await connection.getBalance(keypair.publicKey);
        console.log(`  [check_balance] Balance: ${balance} lamports (${balance / 1e9} SOL)`);
        agentBus.emit("balance_checked", {
            address: keypair.publicKey.toBase58(),
            balance
        });
    }
};

// hold: no-op, agent stays idle for this cycle
export const holdCapability: Capability = {
    name: "hold",
    execute: async (_keypair: Keypair, _targetAddress: string) => {
        console.log(`  [hold] Agent is holding. No action taken.`);
    }
};

// request_airdrop: explicitly requests devnet funds for the agent
export const requestAirdropCapability: Capability = {
    name: "request_airdrop",
    execute: async (keypair: Keypair, _targetAddress: string) => {
        console.log(`  [request_airdrop] Requesting 2 SOL from faucet...`);
        try {
            await airdropSOL(keypair.publicKey);
        } catch (e: any) {
            console.log(`  [request_airdrop] Faucet failed: ${e.message}`);
        }
    }
};

// simulate_swap: mock representing a token swap or staking interaction on a DeFi protocol
export const simulateSwapCapability: Capability = {
    name: "simulate_swap",
    execute: async (keypair: Keypair, _targetAddress: string) => {
        console.log(`  [simulate_swap] Simulating token swap... burning 0.05 SOL in priority fees...`);
        // Just mock a tiny burn / transfer to system program to simulate work
        try {
            await sendSOL(keypair, "11111111111111111111111111111111", 50000000); // 0.05 SOL
            agentBus.emit("transfer_executed", {
                from: keypair.publicKey.toBase58(),
                to: "DeFi_Protocol_Mock",
                amount: 50000000
            });
        } catch (e: any) {
            console.log(`  [simulate_swap] Swap failed: ${e.message}`);
        }
    }
};

// Registry of all available capabilities keyed by name
export const CAPABILITIES: Record<string, Capability> = {
    transfer: transferCapability,
    check_balance: checkBalanceCapability,
    hold: holdCapability,
    request_airdrop: requestAirdropCapability,
    simulate_swap: simulateSwapCapability,
};
