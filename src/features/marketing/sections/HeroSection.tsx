import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMasterWallet } from '@/contexts/MasterWalletContext';
import { toast } from 'sonner';
import {
  Wallet,
  Bot,
  Activity,
  Zap,
  ChevronRight,
  Lock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export function Hero() {
  const [isAnimated, setIsAnimated] = useState(false);
  const navigate = useNavigate();
  const { address } = useMasterWallet();

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-16 left-8 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-16 right-8 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] bg-amber-500/10 rounded-full blur-3xl" />
      </div>

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

      <div className="relative z-10 container mx-auto px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:min-h-[72vh] lg:grid-cols-2 lg:items-stretch">
          <div className="self-center text-left">
            <div className={`transition-all duration-700 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Badge className="mb-6 px-4 py-2 text-sm bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                <Zap className="w-4 h-4 mr-2" />
                DeFi Developer Challenge — Superteam Nigeria
              </Badge>
            </div>

            <h1
              className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent transition-all duration-700 delay-100 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              Autonomous Wallet Ops for Solana Agents
            </h1>

            <p
              className={`text-xl md:text-2xl text-slate-300 mb-4 transition-all duration-700 delay-200 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              Web + CLI + SDK in one operator workflow
            </p>

            <p
              className={`text-lg text-slate-400 mb-10 max-w-xl transition-all duration-700 delay-300 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              Connect a master wallet to unlock web controls, or run fully through CLI/SDK for automation-first operations.
            </p>

            <div
              className={`flex flex-wrap gap-4 transition-all duration-700 delay-400 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white px-8"
                onClick={() => {
                  if (!address) {
                    toast.error('Connect your master wallet to access Dashboard');
                    return;
                  }
                  navigate('/dashboard');
                }}
              >
                <Wallet className="w-5 h-5 mr-2" />
                Open Dashboard
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => navigate('/docs')}
              >
                <Bot className="w-5 h-5 mr-2" />
                Explore Docs
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-6 lg:h-full lg:min-h-[72vh] lg:justify-between">
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm lg:flex-1 animate-card-enter lg:animate-card-float-a">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3">
                  <Wallet className="w-6 h-6 text-cyan-400" />
                </div>
                <CardTitle className="text-lg text-white">Programmatic Wallets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">
                  Provision isolated wallets per agent and enforce policy checks before execution.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm lg:flex-1 animate-card-enter [animation-delay:120ms] lg:animate-card-float-b">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-lg text-white">Execution Guardrails</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">
                  Simulate, validate, retry, and confirm transactions with deterministic safety controls.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm lg:flex-1 animate-card-enter [animation-delay:220ms] lg:animate-card-float-c">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3">
                  <Lock className="w-6 h-6 text-amber-400" />
                </div>
                <CardTitle className="text-lg text-white">Master Wallet Gate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-3">
                  Dashboard controls stay locked until a web master wallet is connected.
                </p>
                <div className="flex gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />Web gated</span>
                  <span className="inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-cyan-300" />CLI/SDK ready</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  );
}
