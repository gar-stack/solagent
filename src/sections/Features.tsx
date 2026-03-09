import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Terminal, 
  Shield, 
  Zap,
  Database,
  Lock,
  Cpu,
  Globe,
  Key,
  Workflow
} from 'lucide-react';

const features = [
  {
    icon: Key,
    title: 'Programmatic Wallet Creation',
    description: 'Create wallets on-the-fly with secure cryptographic key generation. Each AI agent gets its own isolated wallet.',
    badge: 'Core',
    color: 'cyan',
  },
  {
    icon: Zap,
    title: 'Automatic Transaction Signing',
    description: 'Sign transactions autonomously without human intervention. Built-in safety checks prevent unauthorized operations.',
    badge: 'Core',
    color: 'amber',
  },
  {
    icon: Database,
    title: 'SOL & SPL Token Support',
    description: 'Hold and transfer both native SOL and any SPL tokens. Full compatibility with the Solana token ecosystem.',
    badge: 'DeFi',
    color: 'emerald',
  },
  {
    icon: Shield,
    title: 'Security-First Design',
    description: 'Encrypted key storage, whitelist controls, transaction limits, and comprehensive audit trails.',
    badge: 'Security',
    color: 'rose',
  },
  {
    icon: Cpu,
    title: 'AI Agent Framework',
    description: 'Extensible base class for building custom agents. Includes trading bots, liquidity providers, and more.',
    badge: 'AI',
    color: 'sky',
  },
  {
    icon: Workflow,
    title: 'Strategy Engine',
    description: 'Define trading strategies with configurable parameters: risk levels, thresholds, and position sizing.',
    badge: 'Trading',
    color: 'teal',
  },
  {
    icon: Terminal,
    title: 'CLI Interface',
    description: 'Command-line tool for managing agents, checking balances, and executing operations directly.',
    badge: 'DevTools',
    color: 'zinc',
  },
  {
    icon: Globe,
    title: 'Web Dashboard',
    description: 'Real-time monitoring dashboard with agent status, transaction history, and performance analytics.',
    badge: 'UI',
    color: 'blue',
  },
  {
    icon: Lock,
    title: 'Access Controls',
    description: 'Role-based permissions, blacklisted tokens, whitelisted addresses, and emergency pause functionality.',
    badge: 'Security',
    color: 'amber',
  },
];

const featureColorMap: Record<
  string,
  { bg: string; icon: string }
> = {
  cyan: { bg: 'bg-cyan-500/20', icon: 'text-cyan-400' },
  amber: { bg: 'bg-amber-500/20', icon: 'text-amber-400' },
  emerald: { bg: 'bg-emerald-500/20', icon: 'text-emerald-400' },
  rose: { bg: 'bg-rose-500/20', icon: 'text-rose-400' },
  sky: { bg: 'bg-sky-500/20', icon: 'text-sky-400' },
  teal: { bg: 'bg-teal-500/20', icon: 'text-teal-400' },
  zinc: { bg: 'bg-zinc-500/20', icon: 'text-zinc-300' },
  blue: { bg: 'bg-blue-500/20', icon: 'text-blue-400' },
};

const codeExample = `import { AgenticWallet, TradingBot } from 'solagent';

// Create an agentic wallet
const wallet = AgenticWallet.generate({
  network: 'devnet'
});

// Initialize trading bot
const bot = new TradingBot(wallet, {
  name: 'Alpha Trader',
  riskLevel: 'moderate',
  maxTransactionAmount: 1.0,
  allowedActions: []
}, {
  buyThreshold: -2,
  sellThreshold: 5,
  stopLoss: 3,
  takeProfit: 10
});

// Start autonomous trading
await bot.start(60000); // Check every minute`;

export function Features() {
  return (
    <section id="features" className="py-20 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-4 py-2 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need for AI Agents
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A complete toolkit for building autonomous AI agents that can interact 
            with the Solana blockchain securely and efficiently.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => {
            const palette = featureColorMap[feature.color] ?? featureColorMap.cyan;
            return (
            <Card 
              key={index} 
              className="bg-slate-900 border-slate-800 hover:border-cyan-500/40 transition-colors group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-lg ${palette.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${palette.icon}`} />
                  </div>
                  <Badge variant="outline" className="border-slate-700 text-slate-400">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
            );
          })}
        </div>

        {/* Code Example */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Simple Integration</h3>
            <p className="text-slate-400">Get started with just a few lines of code</p>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-lg blur opacity-25" />
            <div className="relative bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-slate-400 text-sm">example.ts</span>
              </div>
              <pre className="p-6 overflow-x-auto">
                <code className="text-sm font-mono text-slate-300">
                  {codeExample.split('\n').map((line, i) => (
                    <div key={i} className="table-row">
                      <span className="table-cell text-slate-600 select-none pr-4 text-right">
                        {i + 1}
                      </span>
                      <span className="table-cell">
                        {line.split(' ').map((word, j) => {
                          if (word.startsWith('import') || word.startsWith('from') || word.startsWith('const') || word.startsWith('await')) {
                            return <span key={j} className="text-cyan-400">{word} </span>;
                          }
                          if (word.startsWith('new') || word.startsWith('TradingBot') || word.startsWith('AgenticWallet')) {
                            return <span key={j} className="text-blue-400">{word} </span>;
                          }
                          if (word.includes('//')) {
                            return <span key={j} className="text-slate-500">{word} </span>;
                          }
                          if (word.includes(':') || word.includes('(') || word.includes(')')) {
                            return <span key={j} className="text-cyan-400">{word} </span>;
                          }
                          return <span key={j}>{word} </span>;
                        })}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
