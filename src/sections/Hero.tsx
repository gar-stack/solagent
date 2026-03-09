import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Bot, 
  Activity,
  Shield,
  Zap,
  ChevronRight
} from 'lucide-react';

export function Hero() {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className={`transition-all duration-700 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Badge className="mb-6 px-4 py-2 text-sm bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Zap className="w-4 h-4 mr-2" />
              DeFi Developer Challenge — Superteam Nigeria
            </Badge>
          </div>

          {/* Main Title */}
          <h1 
            className={`text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent transition-all duration-700 delay-100 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            SolAgent
          </h1>

          {/* Subtitle */}
          <p 
            className={`text-xl md:text-2xl text-slate-300 mb-4 transition-all duration-700 delay-200 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Agentic Wallets for AI Agents on Solana
          </p>

          {/* Description */}
          <p 
            className={`text-lg text-slate-400 mb-10 max-w-2xl mx-auto transition-all duration-700 delay-300 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Autonomous wallet infrastructure that enables AI agents to create wallets, 
            sign transactions, and execute DeFi strategies without human intervention.
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-wrap justify-center gap-4 mb-16 transition-all duration-700 delay-400 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
              onClick={() => scrollToSection('dashboard')}
            >
              <Wallet className="w-5 h-5 mr-2" />
              Launch Dashboard
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={() => scrollToSection('features')}
            >
              <Bot className="w-5 h-5 mr-2" />
              Explore Agents
            </Button>
          </div>

          {/* Feature Cards */}
          <div 
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 delay-500 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                  <Wallet className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-lg text-white">Programmatic Wallets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">
                  AI agents can create and manage wallets autonomously with secure key generation and storage.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-lg text-white">Auto Transaction Signing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">
                  Execute transactions automatically based on AI-driven decisions without manual approval.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
                <CardTitle className="text-lg text-white">Secure by Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">
                  Built-in safety controls, whitelists, and risk management for autonomous operations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  );
}
