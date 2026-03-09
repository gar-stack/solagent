import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Dashboard } from '@/features/dashboard/components/DashboardSection';
import { Footer } from '@/features/marketing/sections/FooterSection';
import { useMasterWallet } from '@/contexts/MasterWalletContext';
import { toast } from 'sonner';

export function DashboardPage() {
  const { address } = useMasterWallet();

  if (!address) {
    return <DashboardBlockedRedirect />;
  }

  return (
    <>
      <Dashboard />
      <Footer />
    </>
  );
}

function DashboardBlockedRedirect() {
  useEffect(() => {
    toast.error('Dashboard requires a connected master wallet');
  }, []);

  return <Navigate to="/" replace />;
}
