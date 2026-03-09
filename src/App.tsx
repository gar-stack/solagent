import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TopNav } from '@/features/navigation/TopNav';

const LandingPage = lazy(() => import('@/pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const DocsPage = lazy(() => import('@/pages/DocsPage').then((module) => ({ default: module.DocsPage })));

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <TopNav />
      <main>
        <Suspense
          fallback={
            <div className="container mx-auto px-4 sm:px-6 py-24 text-slate-300">
              Loading page...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/docs" element={<DocsPage />} />
          </Routes>
        </Suspense>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
