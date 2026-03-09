import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Wallet,
  TrendingUp,
  Droplets,
  Activity,
  Copy,
  Play,
  Pause,
  Bot,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Wifi,
  ShieldAlert,
} from 'lucide-react';
import { useMasterWallet } from '@/contexts/MasterWalletContext';
import {
  DEVNET_RPC_URL,
  LAMPORTS_PER_SOL,
  rpcCall,
  type RpcBalanceResult,
  type RpcSignatureInfo,
} from '@/lib/solanaRpc';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AgentStatus {
  id: string;
  name: string;
  type: 'trading' | 'liquidity';
  status: 'running' | 'stopped';
  walletAddress: string;
  balance: number;
  totalDecisions: number;
  executedDecisions: number;
  lastAction: string;
  profit: number;
}

interface Transaction {
  id: string;
  agent: string;
  type: string;
  amount: number;
  status: 'success' | 'failed';
  timestamp: Date;
  signature: string;
}

interface DevnetStats {
  slot: number;
  blockHeight: number;
  averageBalance: number;
}

const DEVNET_FALLBACK_ADDRESS = '11111111111111111111111111111111';
const DASHBOARD_KILL_SWITCH_KEY = 'solagent.dashboard.killSwitch';

const AGENT_BASE: AgentStatus[] = [
  {
    id: '1',
    name: 'Alpha Trader',
    type: 'trading',
    status: 'running',
    walletAddress: '4ey9hVvngVNGxqbz8kPnFoori9JTK1MzweuAjaLDSXqj',
    balance: 0,
    totalDecisions: 0,
    executedDecisions: 0,
    lastAction: 'Loading...',
    profit: 0,
  },
  {
    id: '2',
    name: 'LP Optimizer',
    type: 'liquidity',
    status: 'running',
    walletAddress: 'D8EzU1Ebn6ihmnyzwPD2wWTTxkC5VtHcyKEzBB7iA6Qq',
    balance: 0,
    totalDecisions: 0,
    executedDecisions: 0,
    lastAction: 'Loading...',
    profit: 0,
  },
  {
    id: '3',
    name: 'Beta Trader',
    type: 'trading',
    status: 'stopped',
    walletAddress: 'HrcPt6xMZVdcaPC5mB7a8FAJqj5azqS1YkCtrEz24jq',
    balance: 0,
    totalDecisions: 0,
    executedDecisions: 0,
    lastAction: 'Loading...',
    profit: 0,
  },
];

export function Dashboard() {
  const [agents, setAgents] = useState<AgentStatus[]>(AGENT_BASE);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [devnetStats, setDevnetStats] = useState<DevnetStats | null>(null);
  const [killSwitchEnabled, setKillSwitchEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(DASHBOARD_KILL_SWITCH_KEY) === 'on';
  });
  const { address, balance, role, canOperateAgents, canControlPlane } = useMasterWallet();

  useEffect(() => {
    let isMounted = true;

    const loadDevnetData = async () => {
      try {
        const hydratedAgents = await Promise.all(
          AGENT_BASE.map(async (agent) => {
            try {
              const [balanceLamports, signatures] = await Promise.all([
                rpcCall<RpcBalanceResult>('getBalance', [agent.walletAddress, { commitment: 'confirmed' }]),
                rpcCall<RpcSignatureInfo[]>('getSignaturesForAddress', [agent.walletAddress, { limit: 8 }]),
              ]);

              const succeeded = signatures.filter((sig) => sig.err === null).length;
              const last = signatures[0]?.blockTime;

              return {
                ...agent,
                balance: balanceLamports.value / LAMPORTS_PER_SOL,
                totalDecisions: signatures.length,
                executedDecisions: succeeded,
                lastAction: last ? formatDistanceToNow(new Date(last * 1000), { addSuffix: true }) : 'No recent tx',
              };
            } catch {
              return {
                ...agent,
                lastAction: 'Wallet fetch failed',
              };
            }
          })
        );

        const allSigs = await Promise.all(
          hydratedAgents.map(async (agent) => {
            try {
              const sigs = await rpcCall<RpcSignatureInfo[]>('getSignaturesForAddress', [agent.walletAddress, { limit: 4 }]);
              return sigs.map((sig) => ({ agent: agent.name, sig }));
            } catch {
              return [];
            }
          })
        );

        let flatSigs = allSigs.flat();

        if (flatSigs.length === 0) {
          const fallback = await rpcCall<RpcSignatureInfo[]>('getSignaturesForAddress', [DEVNET_FALLBACK_ADDRESS, { limit: 6 }]);
          flatSigs = fallback.map((sig) => ({ agent: 'Devnet Network', sig }));
        }

        const txRows = flatSigs
          .sort((a, b) => (b.sig.blockTime || 0) - (a.sig.blockTime || 0))
          .slice(0, 12)
          .map((entry) => ({
            id: entry.sig.signature,
            agent: entry.agent,
            type: 'On-chain Transaction',
            amount: 0,
            status: (entry.sig.err ? 'failed' : 'success') as 'failed' | 'success',
            timestamp: entry.sig.blockTime ? new Date(entry.sig.blockTime * 1000) : new Date(),
            signature: `${entry.sig.signature.slice(0, 6)}...${entry.sig.signature.slice(-6)}`,
          }));

        const [slot, blockHeight] = await Promise.all([
          rpcCall<number>('getSlot', [{ commitment: 'confirmed' }]),
          rpcCall<number>('getBlockHeight', [{ commitment: 'confirmed' }]),
        ]);

        const avgBalance = hydratedAgents.reduce((acc, a) => acc + a.balance, 0) / hydratedAgents.length;

        if (isMounted) {
          setAgents(hydratedAgents);
          setTransactions(txRows);
          setDevnetStats({
            slot,
            blockHeight,
            averageBalance: avgBalance,
          });
        }
      } catch (error) {
        if (isMounted) {
          toast.error(`Devnet fetch failed: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDevnetData();
    const pollId = window.setInterval(() => void loadDevnetData(), 60000);

    return () => {
      isMounted = false;
      window.clearInterval(pollId);
    };
  }, []);

  const copyAddress = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success('Address copied');
  };

  const toggleAgent = (agentId: string) => {
    if (!canOperateAgents) {
      toast.error('Role restriction: operator or admin role required to manage agents.');
      return;
    }

    if (killSwitchEnabled) {
      toast.error('Execution paused. Disable emergency stop before starting or stopping agents.');
      return;
    }

    const targetAgent = agents.find((agent) => agent.id === agentId);
    if (!targetAgent) return;

    const updatedName = targetAgent.name;
    const nextState: 'running' | 'stopped' = targetAgent.status === 'running' ? 'stopped' : 'running';

    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id !== agentId) {
          return agent;
        }

        return {
          ...agent,
          status: nextState,
        };
      })
    );

    toast.info(`${nextState === 'running' ? 'Started' : 'Stopped'} ${updatedName}`);
  };

  const toggleKillSwitch = () => {
    if (!canControlPlane) {
      toast.error('Role restriction: admin role required to control emergency stop.');
      return;
    }

    const next = !killSwitchEnabled;
    setKillSwitchEnabled(next);
    if (next) {
      window.localStorage.setItem(DASHBOARD_KILL_SWITCH_KEY, 'on');
      toast.error('Emergency stop enabled: execution controls are locked.');
    } else {
      window.localStorage.removeItem(DASHBOARD_KILL_SWITCH_KEY);
      toast.success('Emergency stop disabled: execution controls restored.');
    }
  };

  const totalBalance = agents.reduce((sum, a) => sum + a.balance, 0);
  const totalProfit = agents.reduce((sum, a) => sum + a.profit, 0);
  const runningAgents = agents.filter((a) => a.status === 'running').length;
  const txSuccessRate = transactions.length > 0
    ? Math.round((transactions.filter((tx) => tx.status === 'success').length / transactions.length) * 100)
    : 0;
  const balanceSeries = useMemo(
    () => agents.map((agent) => ({ name: agent.name.replace(' ', '\n'), balance: Number(agent.balance.toFixed(4)) })),
    [agents]
  );
  const txSeries = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .map((tx) => ({
          time: `${tx.timestamp.getHours().toString().padStart(2, '0')}:${tx.timestamp.getMinutes().toString().padStart(2, '0')}`,
          success: tx.status === 'success' ? 1 : 0,
        })),
    [transactions]
  );

  return (
    <section id="dashboard" className="py-16 sm:py-20 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Agent Dashboard</h2>
            <p className="text-slate-400">Protected web dashboard with live devnet balances and network activity</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
            <Wifi className="h-3.5 w-3.5" />
            Master Wallet Active
          </div>
          <Button
            variant={killSwitchEnabled ? 'destructive' : 'outline'}
            className={killSwitchEnabled ? '' : 'border-amber-500/40 text-amber-200 hover:bg-amber-500/20'}
            onClick={toggleKillSwitch}
          >
            {killSwitchEnabled ? 'Emergency Stop Active' : 'Enable Emergency Stop'}
          </Button>
        </div>

        <Card className="mb-8 border-slate-800 bg-gradient-to-r from-slate-900/90 to-slate-800/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-slate-400">Authenticated Master Wallet</p>
              <p className="text-lg font-semibold text-white">{address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Unknown'}</p>
              <p className="text-sm text-slate-400">{balance !== null ? `${balance.toFixed(4)} SOL` : 'Balance unavailable'}</p>
              <div className="mt-2 inline-flex items-center gap-2">
                <Badge
                  className={
                    role === 'admin'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : role === 'operator'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : 'bg-slate-700 text-slate-200 border-slate-600'
                  }
                >
                  Role: {role}
                </Badge>
                {!canOperateAgents && (
                  <Badge className="bg-amber-500/15 text-amber-200 border-amber-500/30">
                    Viewer mode: no execution controls
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="bg-slate-900/90 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Balance</p>
                  <p className="text-2xl font-bold text-white">{totalBalance.toFixed(4)} SOL</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/90 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total P&L (sim)</p>
                  <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalProfit >= 0 ? '+' : ''}
                    {totalProfit.toFixed(2)}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/90 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Agents</p>
                  <p className="text-2xl font-bold text-white">{runningAgents} / {agents.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/90 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Devnet Slot</p>
                  <p className="text-2xl font-bold text-white">{devnetStats ? devnetStats.slot.toLocaleString() : '--'}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  {isLoading ? <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /> : <Wifi className="w-6 h-6 text-cyan-400" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="mb-6 flex w-full overflow-x-auto bg-slate-900 border-slate-800">
            <TabsTrigger value="agents" className="data-[state=active]:bg-slate-800">
              <Bot className="w-4 h-4 mr-2" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-slate-800">
              <Activity className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-800">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="bg-slate-900 border-slate-800">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${agent.type === 'trading' ? 'bg-cyan-500/20' : 'bg-emerald-500/20'}`}>
                          {agent.type === 'trading' ? <TrendingUp className="w-5 h-5 text-cyan-400" /> : <Droplets className="w-5 h-5 text-emerald-400" />}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                          <p className="text-slate-400 text-sm capitalize">{agent.type} Bot</p>
                        </div>
                      </div>
                      <Badge
                        variant={agent.status === 'running' ? 'default' : 'secondary'}
                        className={agent.status === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}
                      >
                        {agent.status === 'running' ? 'Running' : 'Stopped'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-400 text-sm">Wallet Address</span>
                        <div className="flex items-center gap-2">
                          <code className="text-cyan-400 text-sm">{agent.walletAddress.slice(0, 8)}...{agent.walletAddress.slice(-4)}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => void copyAddress(agent.walletAddress)}>
                            <Copy className="w-4 h-4 text-slate-400" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-xs mb-1">Balance (devnet)</p>
                          <p className="text-white font-semibold">{agent.balance.toFixed(4)} SOL</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-xs mb-1">P&L (sim)</p>
                          <p className={`font-semibold ${agent.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {agent.profit >= 0 ? '+' : ''}
                            {agent.profit.toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Success Rate</span>
                          <span className="text-white">{agent.totalDecisions > 0 ? Math.round((agent.executedDecisions / agent.totalDecisions) * 100) : 0}%</span>
                        </div>
                        <Progress value={agent.totalDecisions > 0 ? (agent.executedDecisions / agent.totalDecisions) * 100 : 0} className="h-2 bg-slate-800" />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock className="w-4 h-4" />
                          Last action: {agent.lastAction}
                        </div>
                        <Button size="sm" variant={agent.status === 'running' ? 'destructive' : 'default'} onClick={() => toggleAgent(agent.id)}>
                          {agent.status === 'running' ? (
                            <>
                              <Pause className="w-4 h-4 mr-1" /> Stop
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" /> Start
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.status === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          {tx.status === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{tx.type}</p>
                          <p className="text-slate-400 text-sm">{tx.agent}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{tx.amount === 0 ? 'Amount N/A' : `${tx.amount} SOL`}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <code>{tx.signature}</code>
                          <span>•</span>
                          <span>{formatDistanceToNow(tx.timestamp, { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {transactions.length === 0 && <p className="text-slate-400">No recent devnet transactions found for configured addresses.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Devnet Runtime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400">Current Slot</span>
                      <span className="text-white font-semibold">{devnetStats ? devnetStats.slot.toLocaleString() : '--'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400">Block Height</span>
                      <span className="text-white font-semibold">{devnetStats ? devnetStats.blockHeight.toLocaleString() : '--'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400">Average Agent Balance</span>
                      <span className="text-green-400 font-semibold">{devnetStats ? `${devnetStats.averageBalance.toFixed(4)} SOL` : '--'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400">Recent Tx Count</span>
                      <span className="text-white font-semibold">{transactions.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Agent Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Trading Bots</span>
                        <span className="text-white">{agents.filter((a) => a.type === 'trading').length} agents</span>
                      </div>
                      <Progress value={(agents.filter((a) => a.type === 'trading').length / agents.length) * 100} className="h-2 bg-slate-800" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Liquidity Providers</span>
                        <span className="text-white">{agents.filter((a) => a.type === 'liquidity').length} agent</span>
                      </div>
                      <Progress value={(agents.filter((a) => a.type === 'liquidity').length / agents.length) * 100} className="h-2 bg-slate-800" />
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Configured RPC</span>
                        <code className="text-cyan-400 text-xs">{DEVNET_RPC_URL}</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Balance by Agent (SOL)</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={balanceSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <Bar dataKey="balance" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Recent Transaction Reliability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
                    <span className="text-slate-300">Success ratio</span>
                    <span className="text-white font-semibold">{txSuccessRate}%</span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={txSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis domain={[0, 1]} ticks={[0, 1]} stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                          labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Area type="monotone" dataKey="success" stroke="#34d399" fill="#34d39933" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  {!canControlPlane && (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200 text-sm">
                      <ShieldAlert className="h-4 w-4" />
                      Admin role is required for emergency stop controls.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
