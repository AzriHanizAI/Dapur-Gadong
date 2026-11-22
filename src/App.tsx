import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/useCart';
import { Storefront } from '@/components/Storefront';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

function App() {
  const cart = useCart();
  const { session, loading } = useAuth();
  const [loginRequested, setLoginRequested] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-500" />
      </div>
    );
  }

  if (session) {
    return <AdminDashboard />;
  }

  if (loginRequested) {
    return <AdminLogin onBack={() => setLoginRequested(false)} onSuccess={() => setLoginRequested(false)} />;
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Storefront cart={cart} onAddToCart={cart.addItem} onMerchantLogin={() => setLoginRequested(true)} />
    </div>
  );
}

export default App;
