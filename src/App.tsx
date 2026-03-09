import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TopNav } from '@/features/navigation/TopNav';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DocsPage } from '@/pages/DocsPage';

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <TopNav />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/docs" element={<DocsPage />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
