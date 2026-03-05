import { agentBus } from "../utils/eventBus";
import { getAllWallets } from "../wallet/walletRegistry";
import { getMemory } from "../agents/memory";

class DashboardUI {
    private activityFeed: string[] = [];
    private thoughtStream: string[] = [];

    constructor() {
        // Suppress console logs during dashboard render
        this.hijackConsoleLogs();

        // Setup event listeners for the dashboard components
        this.setupListeners();

        // Start UI render loop
        setInterval(() => this.render(), 1000);
    }

    private hijackConsoleLogs() {
        // Original console.log logs into our thought stream instead of breaking the terminal UI
        const originalLog = console.log;
        console.log = (...args) => {
            const msg = args.join(" ");
            this.thoughtStream.push(msg);
            if (this.thoughtStream.length > 10) this.thoughtStream.shift();
        };
    }

    private setupListeners() {
        agentBus.on("transfer_executed", (data) => {
            this.activityFeed.unshift(
                `Agent ${data.from.substring(0, 4)} → Agent ${data.to.substring(0, 4)}: ${(data.amount / 1e9).toFixed(2)} SOL \n  TX: explorer.solana.com/tx/phony_${Date.now()}`
            );
            if (this.activityFeed.length > 5) this.activityFeed.pop();
        });
    }

    private render() {
        // Clear terminal screen
        process.stdout.write('\x1Bc');

        console.info(`+-----------------------------------------+`);
        console.info(`|           SolAgent Dashboard            |`);
        console.info(`+-----------------------------------------+\n`);

        console.info(`Agents`);
        console.info(`------------------------------------------`);

        // Agent List Panel
        const agents = getAllWallets();
        agents.forEach((agent, i) => {
            const memory = getMemory(i + 1);
            console.info(`Agent ${i + 1}`);
            console.info(`Wallet: ${agent.address.substring(0, 4)}...`);
            console.info(`Balance: ${(memory.lastBalance / 1e9).toFixed(2)} SOL`);
            console.info(`Strategy: Active`);
            console.info(`Last Action: ${memory.lastAction || 'Initialization'}\n`);
        });

        console.info(`Agent Thought Stream`);
        console.info(`------------------------------------------`);
        this.thoughtStream.forEach(log => console.info(log));
        console.info(``);

        console.info(`Activity Feed`);
        console.info(`------------------------------------------`);
        this.activityFeed.forEach(feed => console.info(`${feed}\n`));
    }
}

// Export singleton to be booted once
export const dashboard = new DashboardUI();
