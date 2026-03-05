import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgents } from './hooks/useAgents';
import { ActivityFeed } from './components/ActivityFeed';
import { Bot, Activity, Brain, Shield, ChevronRight, Zap, Wallet, BarChart3 } from 'lucide-react';

// --- Sub-components ---

const Navbar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 glass border-b-0 backdrop-blur-xl bg-background/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Bot size={24} className="text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight">Sol<span className="text-primary-light">Agent</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-white/60 font-medium">
                <a href="#" className="hover:text-white transition-colors">Infrastructure</a>
                <a href="#" className="hover:text-white transition-colors">Agents</a>
                <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
            <button className="btn-primary flex items-center gap-2">
                Launch Dashboard <ChevronRight size={18} />
            </button>
        </div>
    </nav>
);

const Hero = ({ onLaunch }: { onLaunch: () => void }) => (
    <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10" />
        <div className="max-w-4xl mx-auto text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm font-medium text-primary-light border-primary/20"
            >
                <Zap size={14} /> The Future of Autonomous Finance
            </motion.div>
            <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1]"
            >
                Your Agents. <br />
                <span className="gradient-text">Their Wallets.</span> <br />
                Pure Autonomy.
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto"
            >
                The first lightweight infra for truly autonomous AI agents on Solana.
                Self-custodial, event-driven, and LLM-powered decision making out of the box.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
            >
                <button onClick={onLaunch} className="btn-primary text-lg px-8 py-4">
                    View Active Agents
                </button>
                <button className="btn-outline text-lg px-8 py-4">
                    Read Documentation
                </button>
            </motion.div>
        </div>
    </div>
);

const AgentCard = ({ agent }: { agent: any }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Bot size={80} />
        </div>
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10">
                <Activity size={20} className="text-secondary-light" />
            </div>
            <div>
                <h3 className="font-bold text-lg">Agent #{agent.numericId}</h3>
                <p className="text-sm text-white/40 font-mono flex items-center gap-1">
                    {agent.address?.slice(0, 4)}...{agent.address?.slice(-4)}
                    <span className="p-1 rounded bg-white/5"><Wallet size={10} /></span>
                </p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Balance</p>
                <p className="text-xl font-bold">{(agent.balance / 1e9).toFixed(3)} <span className="text-xs text-secondary-light">SOL</span></p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Cycles</p>
                <p className="text-xl font-bold">{agent.cycleCount}</p>
            </div>
        </div>

        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-[10px] uppercase tracking-wider text-primary-light mb-1 flex items-center gap-1">
                <Brain size={10} /> Last Thought
            </p>
            <p className="text-sm font-medium italic text-white/80 line-clamp-2">
                "{agent.lastAction || 'Waiting for first cycle...'}"
            </p>
        </div>
    </motion.div>
);

const Dashboard = ({ agents, activities }: { agents: any[], activities: any[] }) => (
    <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">Live Registry</h2>
                <p className="text-white/40">Monitoring {agents.length} autonomous agents in real-time.</p>
            </div>
            <div className="flex gap-4">
                <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
                    <BarChart3 size={18} className="text-primary-light" />
                    <span className="text-sm font-medium">{agents.length} Nodes Online</span>
                </div>
                <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
                    <Shield size={18} className="text-primary-light" />
                    <span className="text-sm font-medium">Devnet Sandbox</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                ))}
            </div>
            <div className="lg:col-span-1 h-fit sticky top-32">
                <ActivityFeed activities={activities} />
            </div>
        </div>
    </div>
);

// --- Main App ---

export default function App() {
    const { agents, loading, socket } = useAgents();
    const [showDashboard, setShowDashboard] = useState(false);
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        if (!socket) return;

        const handleTransfer = (data: any) => {
            setActivities(prev => [{
                id: Math.random().toString(36).substr(2, 9),
                from: data.from,
                to: data.to,
                amount: data.amount,
                type: 'transfer',
                timestamp: Date.now()
            }, ...prev].slice(0, 10));
        };

        socket.on('transfer_executed', handleTransfer);
        return () => { socket.off('transfer_executed', handleTransfer); };
    }, [socket]);

    return (
        <div className="min-h-screen bg-subtle-grid bg-fixed">
            <Navbar />

            <AnimatePresence mode="wait">
                {!showDashboard ? (
                    <motion.div
                        key="landing"
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Hero onLaunch={() => setShowDashboard(true)} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-32"
                    >
                        <Dashboard agents={agents} activities={activities} />
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="py-10 border-t border-white/5 text-center text-white/20 text-sm">
                &copy; 2026 SolAgent. Built for the Autonomous Finance Hackathon.
            </footer>
        </div>
    );
}
