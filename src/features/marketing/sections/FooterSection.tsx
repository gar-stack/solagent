import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Twitter, 
  MessageCircle,
  ExternalLink,
  Heart
} from 'lucide-react';

export function Footer() {
  const appUrl = import.meta.env.VITE_APP_URL as string | undefined;
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">SolAgent</h3>
            <p className="text-slate-400 mb-6 max-w-md">
              Agentic Wallets for AI Agents on Solana. Built for the DeFi Developer Challenge 
              by Superteam Nigeria.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => window.open('https://github.com/gar-stack/solagent', '_blank')}
              >
                <Github className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => window.open('https://twitter.com/superteamng', '_blank')}
              >
                <Twitter className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => window.open('https://t.me/superteamng', '_blank')}
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/docs" className="text-slate-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-slate-400 hover:text-white transition-colors">
                  Docs Portal
                </Link>
              </li>
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/gar-stack/solagent/blob/main/SKILLS.md" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center"
                >
                  SKILLS.md
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* Challenge Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Challenge</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://superteam.fun/earn/listing/defi-developer-challenge-agentic-wallets-for-ai-agents" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center"
                >
                  DeFi Developer Challenge
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="https://superteam.fun/earn/s/superteamnigeria" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center"
                >
                  Superteam Nigeria
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href={appUrl || 'https://vercel.com/new'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center"
                >
                  Live App
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="https://solana.com/docs" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center"
                >
                  Solana Docs
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/gar-stack/solagent/blob/main/docs/DEEP_DIVE.md" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center"
                >
                  Deep Dive
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 SolAgent. Built with <Heart className="w-4 h-4 inline text-red-500" /> for Superteam Nigeria.
          </p>
          <p className="text-slate-600 text-sm">
            Open source under MIT License{appUrl ? ` • ${appUrl}` : ' • set VITE_APP_URL after Vercel deploy'}
          </p>
        </div>
      </div>
    </footer>
  );
}
