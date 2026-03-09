import { Dashboard } from '@/features/dashboard/components/DashboardSection';
import { Footer } from '@/features/marketing/sections/FooterSection';
import { useMasterWallet } from '@/contexts/MasterWalletContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Wallet } from 'lucide-react';

export function DashboardPage() {
  const { address, connect, isConnecting } = useMasterWallet();

  if (!address) {
    return (
      <section className="min-h-[70vh] bg-slate-950 py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <Lock className="w-5 h-5 text-amber-300 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-white">Dashboard Access Locked</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Connect a master wallet on web to access dashboard controls. CLI/SDK users can continue using `solagent` and SDK flows independently.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="bg-cyan-600 hover:bg-cyan-500 text-white" onClick={() => void connect()} disabled={isConnecting}>
                  <Wallet className="w-4 h-4 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect Master Wallet'}
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-200" asChild>
                  <a href="/">Go to Landing</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <>
      <Dashboard />
      <Footer />
    </>
  );
}
