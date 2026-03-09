import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  XCircle
} from 'lucide-react';

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

export function Dashboard() {
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: '1',
      name: 'Alpha Trader',
      type: 'trading',
      status: 'running',
      walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      balance: 12.45,
      totalDecisions: 156,
      executedDecisions: 89,
      lastAction: '2 min ago',
      profit: 23.5,
    },
    {
      id: '2',
      name: 'LP Optimizer',
      type: 'liquidity',
      status: 'running',
      walletAddress: '8yLYtg3DX98d98TYKTEqcE6kClfVrB94UASvKiptgBtV',
      balance: 25.80,
      totalDecisions: 89,
      executedDecisions: 45,
      lastAction: '5 min ago',
      profit: 12.3,
    },
    {
      id: '3',
      name: 'Beta Trader',
      type: 'trading',
      status: 'stopped',
      walletAddress: '9zMZtg4EY09e09UZLUFrdF7kDmgC05VBTwKjquhCuW',
      balance: 5.20,
      totalDecisions: 45,
      executedDecisions: 23,
      lastAction: '1 hour ago',
      profit: -2.1,
    },
  ]);

  const [transactions] = useState<Transaction[]>([
    { id: '1', agent: 'Alpha Trader', type: 'SOL Transfer', amount: 0.5, status: 'success', timestamp: new Date(Date.now() - 120000), signature: '5xK...9mP' },
    { id: '2', agent: 'LP Optimizer', type: 'Add Liquidity', amount: 2.0, status: 'success', timestamp: new Date(Date.now() - 300000), signature: '7yL...2nQ' },
    { id: '3', agent: 'Alpha Trader', type: 'Token Swap', amount: 1.2, status: 'success', timestamp: new Date(Date.now() - 600000), signature: '9zM...4oR' },
    { id: '4', agent: 'Beta Trader', type: 'SOL Transfer', amount: 0.3, status: 'failed', timestamp: new Date(Date.now() - 900000), signature: '1aB...6pS' },
  ]);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    // Show toast notification would go here
    alert('Address copied to clipboard!');
  };

  const toggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: agent.status === 'running' ? 'stopped' : 'running' }
        : agent
    ));
    
    const agent = agents.find(a => a.id === agentId);
    alert(`${agent?.status === 'running' ? 'Stopped' : 'Started'} ${agent?.name}`);
  };

  const totalBalance = agents.reduce((sum, a) => sum + a.balance, 0);
  const totalProfit = agents.reduce((sum, a) => sum + a.profit, 0);
  const runningAgents = agents.filter(a => a.status === 'running').length;

  return (
    <section id="dashboard" className="py-20 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Agent Dashboard</h2>
          <p className="text-slate-400">Monitor and manage your AI agent wallets in real-time</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Balance</p>
                  <p className="text-2xl font-bold text-white">{totalBalance.toFixed(2)} SOL</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total P&L</p>
                  <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
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

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Transactions</p>
                  <p className="text-2xl font-bold text-white">{transactions.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="bg-slate-900 border-slate-800 mb-6">
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
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          agent.type === 'trading' ? 'bg-purple-500/20' : 'bg-blue-500/20'
                        }`}>
                          {agent.type === 'trading' ? (
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                          ) : (
                            <Droplets className="w-5 h-5 text-blue-400" />
                          )}
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => copyAddress(agent.walletAddress)}
                          >
                            <Copy className="w-4 h-4 text-slate-400" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-xs mb-1">Balance</p>
                          <p className="text-white font-semibold">{agent.balance.toFixed(2)} SOL</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-xs mb-1">P&L</p>
                          <p className={`font-semibold ${agent.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {agent.profit >= 0 ? '+' : ''}{agent.profit.toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Decision Rate</span>
                          <span className="text-white">
                            {Math.round((agent.executedDecisions / agent.totalDecisions) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(agent.executedDecisions / agent.totalDecisions) * 100} 
                          className="h-2 bg-slate-800"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock className="w-4 h-4" />
                          Last action: {agent.lastAction}
                        </div>
                        <Button
                          size="sm"
                          variant={agent.status === 'running' ? 'destructive' : 'default'}
                          onClick={() => toggleAgent(agent.id)}
                        >
                          {agent.status === 'running' ? (
                            <><Pause className="w-4 h-4 mr-1" /> Stop</>
                          ) : (
                            <><Play className="w-4 h-4 mr-1" /> Start</>
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
                    <div 
                      key={tx.id} 
                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tx.status === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {tx.status === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{tx.type}</p>
                          <p className="text-slate-400 text-sm">{tx.agent}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{tx.amount} SOL</p>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <code>{tx.signature}</code>
                          <span>•</span>
                          <span>{Math.round((Date.now() - tx.timestamp.getTime()) / 60000)}m ago</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400">Win Rate</span>
                      <span className="text-green-400 font-semibold">68.5%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400">Average Return/Trade</span>
                      <span className="text-green-400 font-semibold">+2.34%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400">Sharpe Ratio</span>
                      <span className="text-white font-semibold">1.85</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400">Max Drawdown</span>
                      <span className="text-red-400 font-semibold">-5.2%</span>
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
                        <span className="text-white">2 agents</span>
                      </div>
                      <Progress value={66} className="h-2 bg-slate-800" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Liquidity Providers</span>
                        <span className="text-white">1 agent</span>
                      </div>
                      <Progress value={33} className="h-2 bg-slate-800" />
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Total Agents</span>
                        <span className="text-white font-semibold">3</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
