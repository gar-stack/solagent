import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Zap, Clock } from 'lucide-react';

interface ActivityItem {
    id: string;
    from: string;
    to: string;
    amount: number;
    type: 'transfer' | 'swap' | 'airdrop';
    timestamp: number;
}

export const ActivityFeed = ({ activities }: { activities: ActivityItem[] }) => {
    return (
        <div className="glass-card h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Zap size={18} className="text-secondary-light" /> Live Activity
                </h3>
                <span className="px-2 py-1 rounded bg-secondary/10 text-[10px] font-bold text-secondary-light uppercase tracking-widest">
                    Real-time
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px]">
                <AnimatePresence initial={false}>
                    {activities.length === 0 ? (
                        <p className="text-white/20 text-sm italic text-center py-10">No recent activity detected...</p>
                    ) : (
                        activities.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                                        <ArrowUpRight size={14} className="text-secondary-light" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-white/80">
                                            {item.from.slice(0, 4)}... sent {(item.amount / 1e9).toFixed(2)} SOL
                                        </p>
                                        <p className="text-[10px] text-white/30 flex items-center gap-1">
                                            <Clock size={8} /> {new Date(item.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={`https://explorer.solana.com/tx/phony_${item.id}?cluster=devnet`}
                                    target="_blank"
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/20 hover:text-white transition-all"
                                >
                                    <Zap size={14} />
                                </a>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
