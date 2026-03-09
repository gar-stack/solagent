import { Toaster } from '@/components/ui/sonner';
import { Hero } from './sections/Hero';
import { Dashboard } from './sections/Dashboard';
import { Features } from './sections/Features';
import { Documentation } from './sections/Documentation';
import { Footer } from './sections/Footer';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Hero />
      <Dashboard />
      <Features />
      <Documentation />
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
