import { agentBus } from "./eventBus";

class Telemetry {
    public totalCycles = 0;
    public totalTransactions = 0;
    public transfersPerAgent: Record<string, number> = {};

    constructor() {
        agentBus.on("cycle_completed", () => {
            this.totalCycles++;
        });

        agentBus.on("transfer_executed", (data) => {
            this.totalTransactions++;
            const from = data.from;
            this.transfersPerAgent[from] = (this.transfersPerAgent[from] || 0) + 1;
        });
    }

    public getMetrics() {
        return {
            totalCycles: this.totalCycles,
            totalTransactions: this.totalTransactions,
            transfersPerAgent: this.transfersPerAgent
        };
    }
}

// Export singleton
export const telemetry = new Telemetry();
