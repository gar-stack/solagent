import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMasterWallet } from '@/contexts/MasterWalletContext';
import { Github, LogOut, RefreshCw, Wallet } from 'lucide-react';
import { toast } from 'sonner';

function navClass({ isActive }: { isActive: boolean }) {
  return `text-sm transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`;
}

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, balance, connect, disconnect, refresh, isConnecting } = useMasterWallet();

  const guardDashboardNavigation = (event: { preventDefault: () => void }) => {
    if (address) return;
    event.preventDefault();
    toast.error('Connect your master wallet to open Dashboard');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="font-semibold text-white tracking-tight">SolAgent</Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <a
            href="/dashboard"
            className={`text-sm transition-colors ${location.pathname === '/dashboard' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={(e) => {
              guardDashboardNavigation(e);
              if (address) navigate('/dashboard');
            }}
          >
            Dashboard
          </a>
          <NavLink to="/docs" className={navClass}>Documentation</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {address ? (
            <>
              <div className="hidden sm:block text-right mr-2">
                <p className="text-xs text-slate-300">{address.slice(0, 6)}...{address.slice(-4)}</p>
                <p className="text-[11px] text-slate-500">{balance !== null ? `${balance.toFixed(4)} SOL` : 'Balance --'}</p>
              </div>
              <Button size="sm" variant="secondary" className="bg-slate-800 text-slate-200 hover:bg-slate-700" onClick={() => void refresh()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => void disconnect()}>
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            </>
          ) : (
            <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white" onClick={() => void connect()} disabled={isConnecting}>
              <Wallet className="w-4 h-4 mr-1" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
          <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" asChild>
            <a href="https://github.com/gar-stack/solagent" target="_blank" rel="noreferrer">
              <Github className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
      <div className="md:hidden border-t border-slate-800/60">
        <div className="container mx-auto px-4 py-2 flex items-center gap-4 overflow-x-auto">
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <a
            href="/dashboard"
            className={`text-sm transition-colors ${location.pathname === '/dashboard' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={(e) => {
              guardDashboardNavigation(e);
              if (address) navigate('/dashboard');
            }}
          >
            Dashboard
          </a>
          <NavLink to="/docs" className={navClass}>Documentation</NavLink>
        </div>
      </div>
    </header>
  );
}
