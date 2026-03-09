import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Code2, 
  FileText, 
  Github, 
  ExternalLink,
  Terminal,
  Package,
  Shield,
  Cpu,
  ListChecks,
  Layers3,
  Rocket,
  Search
} from 'lucide-react';

const docs = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of SolAgent and set up your first agentic wallet.',
    icon: BookOpen,
    link: '#getting-started',
  },
  {
    title: 'API Reference',
    description: 'Complete documentation of all classes, methods, and interfaces.',
    icon: Code2,
    link: '#api-reference',
  },
  {
    title: 'Security Guide',
    description: 'Best practices for securing AI agent wallets and transactions.',
    icon: Shield,
    link: '#security',
  },
  {
    title: 'Agent Development',
    description: 'Build custom AI agents with the extensible agent framework.',
    icon: Cpu,
    link: '#agents',
  },
];

const installationSteps = [
  {
    title: 'Install via npm',
    command: 'npm install solagent',
    description: 'Install the SolAgent SDK in your project',
  },
  {
    title: 'Install via yarn',
    command: 'yarn add solagent',
    description: 'Alternative installation using yarn',
  },
  {
    title: 'Clone Repository',
    command: 'git clone https://github.com/gar-stack/solagent.git',
    description: 'Clone the source code for development',
  },
];

const quickStartCode = `# Install dependencies
npm install @solana/web3.js @solana/spl-token

# Create a new wallet
import { AgenticWallet } from 'solagent';

const wallet = AgenticWallet.generate({
  network: 'devnet',
  commitment: 'confirmed'
});

console.log('Wallet address:', wallet.getAddress());

# Request airdrop (devnet only)
await wallet.requestAirdrop(2);

# Check balance
const balance = await wallet.getSolBalance();
console.log('Balance:', balance, 'SOL');`;

export function Documentation() {
  const [query, setQuery] = useState('');
  const filteredDocs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return docs;
    return docs.filter((doc) =>
      `${doc.title} ${doc.description}`.toLowerCase().includes(needle)
    );
  }, [query]);

  return (
    <section id="documentation" className="py-20 bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-4 py-2 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
            Documentation
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Learn & Build
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Comprehensive documentation to help you get started and build 
            powerful AI agents on Solana.
          </p>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto mt-3">
            Web dashboard access uses connected master wallet. CLI/SDK users authenticate and operate directly in terminal/code.
          </p>
        </div>

        {/* Doc Cards */}
        <div className="mb-6 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search docs by topic (security, API, agents...)"
              className="pl-9 bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {filteredDocs.map((doc, index) => (
            <Card 
              key={index} 
              className="bg-slate-950 border-slate-800 hover:border-cyan-600/50 transition-colors cursor-pointer group"
            >
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-slate-700 transition-colors">
                  <doc.icon className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white text-lg">{doc.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">
                  {doc.description}
                </p>
                <Button variant="link" className="p-0 h-auto text-cyan-400 hover:text-cyan-300">
                  Read More <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredDocs.length === 0 && (
          <p className="text-center text-slate-400 mb-16">No docs matched your search query.</p>
        )}

        {/* Quick Start */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="npm" className="w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Quick Start</h3>
              <TabsList className="bg-slate-950 border-slate-800 w-full sm:w-auto overflow-x-auto">
                <TabsTrigger value="npm" className="data-[state=active]:bg-slate-800">
                  <Package className="w-4 h-4 mr-2" />
                  npm
                </TabsTrigger>
                <TabsTrigger value="yarn" className="data-[state=active]:bg-slate-800">
                  <Package className="w-4 h-4 mr-2" />
                  yarn
                </TabsTrigger>
                <TabsTrigger value="git" className="data-[state=active]:bg-slate-800">
                  <Github className="w-4 h-4 mr-2" />
                  git
                </TabsTrigger>
              </TabsList>
            </div>

            {installationSteps.map((step, index) => (
              <TabsContent key={index} value={['npm', 'yarn', 'git'][index]}>
                <Card className="bg-slate-950 border-slate-800">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 mb-4">{step.description}</p>
                    <div className="relative">
                      <pre className="p-4 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
                        <code className="text-sm font-mono text-cyan-400">
                          {step.command}
                        </code>
                      </pre>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-2 right-2 text-slate-400 hover:text-white"
                        onClick={() => navigator.clipboard.writeText(step.command)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Example Code */}
          <Card className="mt-8 bg-slate-950 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-green-400" />
                <CardTitle className="text-white">Example Usage</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
                <code className="text-sm font-mono text-slate-300">
                  {quickStartCode.split('\n').map((line, i) => (
                    <div key={i} className="table-row">
                      <span className="table-cell text-slate-600 select-none pr-4 text-right">
                        {i + 1}
                      </span>
                      <span className="table-cell">
                        {line.startsWith('#') ? (
                          <span className="text-slate-500">{line}</span>
                        ) : line.startsWith('import') || line.startsWith('const') || line.startsWith('await') ? (
                          <>
                            <span className="text-cyan-400">{line.split(' ')[0]} </span>
                            <span className="text-slate-300">{line.substring(line.indexOf(' ') + 1)}</span>
                          </>
                        ) : (
                          <span className="text-slate-300">{line}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-950 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2 text-cyan-300">
                  <Layers3 className="w-4 h-4" />
                  <CardTitle className="text-white text-lg">Architecture</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>1. SDK layer handles wallets, signing, and transaction execution.</p>
                <p>2. Agent layer evaluates market data and emits constrained decisions.</p>
                <p>3. Dashboard layer provides monitoring, access control, and operational visibility.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-950 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2 text-emerald-300">
                  <ListChecks className="w-4 h-4" />
                  <CardTitle className="text-white text-lg">Operations Playbook</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>1. Create/fund wallet on devnet.</p>
                <p>2. Configure policy limits and allowed actions.</p>
                <p>3. Authorize dashboard with connected master wallet.</p>
                <p>4. Monitor health, logs, and balances before any promotion.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-950 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2 text-amber-300">
                  <Rocket className="w-4 h-4" />
                  <CardTitle className="text-white text-lg">Production Notes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Use dedicated secret management and avoid plaintext local key storage.</p>
                <p>Integrate real market data providers and complete unimplemented action executors.</p>
                <p>Add CI tests for strategy, security guardrails, and end-to-end flows.</p>
              </CardContent>
            </Card>
          </div>

          {/* GitHub Link */}
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => window.open('https://github.com/gar-stack/solagent', '_blank')}
            >
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
