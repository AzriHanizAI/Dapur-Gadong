import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Package, LogOut, RefreshCw } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { fetchOrders, subscribeToOrders } from '@/lib/adminOrders';
import { fetchProducts } from '@/lib/products';
import type { OrderRow, Product } from '@/lib/types';
import { OrdersTab } from './OrdersTab';
import { ProductsTab } from './ProductsTab';

type Tab = 'orders' | 'products';

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const result = await fetchOrders();
    if (result.ok) {
      setOrders(result.orders);
      setOrdersError(null);
    } else {
      setOrdersError(result.error);
    }
    setOrdersLoading(false);
  }, []);

  const loadProducts = useCallback(async () => {
    const result = await fetchProducts(true);
    if (result.ok) {
      setProducts(result.products);
      setProductsError(null);
    } else {
      setProductsError(result.error);
    }
    setProductsLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
    const unsubscribe = subscribeToOrders(() => loadOrders());
    return unsubscribe;
  }, [loadOrders]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleProductAvailabilityChanged = (id: string, isAvailable: boolean) => {
    setProducts((current) => current.map((product) => (product.id === id ? { ...product, is_available: isAvailable } : product)));
  };

  const handleOrderStatusChanged = (id: string, status: OrderRow['status']) => {
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order)));
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-neutral-50 shadow-xl">
      {/* Header */}
      <header className="bg-neutral-900 px-5 pb-4 pt-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-extrabold">Dapur Gadong Admin</h1>
            <p className="text-[11px] text-neutral-400">Merchant Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadOrders();
                loadProducts();
              }}
              aria-label="Refresh data"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-neutral-200 transition hover:bg-white/20 active:scale-90"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-neutral-200 transition hover:bg-white/20 active:scale-90"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1.5">
          {(
            [
              { id: 'orders', label: 'Orders', icon: ClipboardList, badge: pendingCount },
              { id: 'products', label: 'Products', icon: Package, badge: 0 },
            ] as const
          ).map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition active:scale-[0.98] ${
                tab === id ? 'bg-white text-neutral-900 shadow-md' : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {badge > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-extrabold text-white">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="pb-safe">
        {tab === 'orders' ? (
          <OrdersTab
            orders={orders}
            loading={ordersLoading}
            error={ordersError}
            onStatusChanged={handleOrderStatusChanged}
          />
        ) : (
          <ProductsTab
            products={products}
            loading={productsLoading}
            error={productsError}
            onRefresh={loadProducts}
            onProductAvailabilityChanged={handleProductAvailabilityChanged}
          />
        )}
      </main>
    </div>
  );
}
