import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { agentBus } from "../utils/eventBus";
import { getAllWallets } from "../wallet/walletRegistry";
import { getMemory } from "../agents/memory";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// REST endpoint to get the initial snapshot of all agents
app.get("/api/agents", (req, res) => {
    const wallets = getAllWallets();
    const agents = wallets.map((w: any) => {
        // A quick hack to extract agent ID number from "agent_xxxxxxxx" format
        let numericId = 1;
        if (w.id) {
            // Just generate an ordinal ID for UI purposes
            numericId = parseInt(w.id.replace(/\D/g, '')) || Math.floor(Math.random() * 100);
        }

        // Actually, our memory uses integer IDs like 1, 2, 3 based on the index.
        // Let's rely on the index array mapping similar to how startSimulation does.
        return w;
    });

    // Re-map with actual memory states by index since memory uses 1, 2, 3 keys
    const agentSnapshot = agents.map((w, i) => {
        const mem = getMemory(i + 1);
        return {
            id: w.id,
            numericId: i + 1,
            address: w.address,
            balance: mem.lastBalance,
            lastAction: mem.lastAction,
            cycleCount: mem.cycleCount,
            recentTransactions: mem.recentTransactions
        };
    });

    res.json(agentSnapshot);
});

// Websocket Streaming
io.on("connection", (socket) => {
    console.log(`[API] Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`[API] Client disconnected: ${socket.id}`);
    });
});

// Broadcast Agent Events directly to the UI
export function connectAgentBusToWebSockets() {
    agentBus.on("transfer_executed", (data) => {
        io.emit("transfer_executed", data);
    });

    agentBus.on("balance_checked", (data) => {
        io.emit("balance_checked", data);
    });

    agentBus.on("cycle_completed", (data) => {
        io.emit("cycle_completed", data);
    });

    // Assuming decisionEngine or executor emits 'agent_action' or we can add it later
    // We can pass general thought streams this way.
}

export function startApiServer(port: number = 3001) {
    connectAgentBusToWebSockets();

    server.listen(port, () => {
        console.log(`\n[API] Backend Web Server listening on http://localhost:${port}`);
    });
}
