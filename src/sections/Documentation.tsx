import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Code2, 
  FileText, 
  Github, 
  ExternalLink,
  Terminal,
  Package,
  Shield,
  Cpu
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
    command: 'git clone https://github.com/superteamng/solagent.git',
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
  return (
    <section id="documentation" className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-4 py-2 bg-blue-500/20 text-blue-300 border-blue-500/30">
            Documentation
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Learn & Build
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Comprehensive documentation to help you get started and build 
            powerful AI agents on Solana.
          </p>
        </div>

        {/* Doc Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {docs.map((doc, index) => (
            <Card 
              key={index} 
              className="bg-slate-950 border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
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
                <Button variant="link" className="p-0 h-auto text-blue-400 hover:text-blue-300">
                  Read More <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Start */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="npm" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Quick Start</h3>
              <TabsList className="bg-slate-950 border-slate-800">
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
                            <span className="text-purple-400">{line.split(' ')[0]} </span>
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

          {/* GitHub Link */}
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => window.open('https://github.com/superteamng/solagent', '_blank')}
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
