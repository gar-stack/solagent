import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Agent {
    id: string;
    numericId: number;
    address: string;
    balance: number;
    lastAction: string | null;
    cycleCount: number;
    recentTransactions: any[];
}

export const useAgents = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);

    const fetchAgents = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:3001/api/agents');
            const data = await res.json();
            setAgents(data);
        } catch (err) {
            console.error('Failed to fetch agents:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAgents();

        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        newSocket.on('cycle_completed', (data: { agentId: number }) => {
            // Opt out of full refetch for every ping, but maybe updates balance
            fetchAgents();
        });

        newSocket.on('transfer_executed', (data) => {
            fetchAgents();
        });

        return () => {
            newSocket.disconnect();
        };
    }, [fetchAgents]);

    return { agents, loading, socket };
};
