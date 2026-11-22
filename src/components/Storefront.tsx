import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, MapPin, Lock } from 'lucide-react';
import { CATEGORIES } from '@/lib/storeData';
import { fetchProducts } from '@/lib/products';
import { formatBND } from '@/lib/format';
import type { CartItem, Product } from '@/lib/types';
import { ProductCard } from './ProductCard';
import { BottomSheet, SlideOver } from './Sheets';
import { ProductSheet } from './ProductSheet';
import { CartPanel } from './CartPanel';
import { PaymentScreen } from './PaymentScreen';

type Panel = 'none' | 'cart' | 'checkout';

interface StorefrontProps {
  cart: {
    items: CartItem[];
    subtotal: number;
    itemCount: number;
    updateQuantity: (key: string, delta: number) => void;
    removeItem: (key: string) => void;
    clear: () => void;
  };
  onAddToCart: (input: { product: Product; selectedOptions: Record<string, string>; notes: string; quantity: number }) => void;
  onMerchantLogin: () => void;
}

export function Storefront({ cart, onAddToCart, onMerchantLogin }: StorefrontProps) {
  const [category, setCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [panel, setPanel] = useState<Panel>('none');
  const [products, setProducts] = useState<Product[]>([]);
  const [menuError, setMenuError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProducts(false).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setProducts(result.products);
        setMenuError(null);
      } else {
        setMenuError(result.error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => (category === 'all' ? products : products.filter((p) => p.category === category)),
    [category, products]
  );

  useEffect(() => {
    document.body.style.overflow = panel !== 'none' || selectedProduct ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [panel, selectedProduct]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-neutral-50 shadow-xl">
      {/* Hero header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 px-5 pb-16 pt-8 text-white">
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-10 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl ring-1 ring-white/25 backdrop-blur">
              🍲
            </div>
            <div>
              <h1 className="text-lg font-extrabold leading-tight">Dapur Gadong</h1>
              <p className="text-[11px] font-medium text-brand-100">Home-cooked Bruneian favourites</p>
            </div>
          </div>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-leaf-400/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-leaf-900 shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf-900 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-leaf-900" />
            </span>
            Open for Orders
          </span>
        </div>
        <div className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-brand-50 ring-1 ring-white/15">
          <MapPin className="h-3 w-3" />
          Bandar Seri Begawan &amp; Gadong
        </div>
      </header>

      {/* Content overlapping the hero */}
      <main className="relative -mt-10 rounded-t-3xl bg-neutral-50 px-4 pb-32 pt-5">
        {/* Category pills */}
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 ${
                  active
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:ring-brand-300'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Product list */}
        {menuError && (
          <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-center text-xs font-semibold text-red-600">{menuError}</p>
        )}
        {!menuError && filtered.length === 0 && (
          <p className="mt-6 rounded-xl bg-neutral-100 px-4 py-6 text-center text-xs font-semibold text-neutral-400">
            No items in this category yet.
          </p>
        )}
        <div className="mt-4 space-y-3">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              description={product.description}
              price={formatBND(product.price)}
              emoji={product.emoji}
              accent={product.accent}
              tag={product.tag ?? undefined}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-neutral-400">
          Orders are confirmed via WhatsApp.<br />
          Pay with BIBD QuickPay or cash on delivery.
        </p>
        <button
          onClick={onMerchantLogin}
          className="mx-auto mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-neutral-300 transition hover:text-neutral-500"
        >
          <Lock className="h-3 w-3" />
          Merchant Login
        </button>
      </main>

      {/* Sticky cart bar */}
      {cart.itemCount > 0 && panel === 'none' && !selectedProduct && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] p-4 pb-safe animate-slide-up">
          <button
            onClick={() => setPanel('cart')}
            className="flex w-full items-center justify-between rounded-2xl bg-neutral-900 px-5 py-4 text-white shadow-2xl ring-1 ring-white/10 transition hover:bg-neutral-800 active:scale-[0.98]"
          >
            <span className="relative flex items-center gap-3">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-extrabold text-neutral-900 animate-pop">
                  {cart.itemCount}
                </span>
              </span>
              <span className="text-sm font-bold">View Cart</span>
            </span>
            <span className="text-base font-extrabold tabular-nums">{formatBND(cart.subtotal)}</span>
          </button>
        </div>
      )}

      {/* Product customization sheet */}
      <ProductSheet
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(input) => {
          onAddToCart(input);
          setSelectedProduct(null);
          setPanel('cart');
        }}
      />

      {/* Cart slide-over */}
      <SlideOver open={panel === 'cart'} onClose={() => setPanel('none')} title="Your Order">
        <CartPanel
          items={cart.items}
          subtotal={cart.subtotal}
          updateQuantity={cart.updateQuantity}
          removeItem={cart.removeItem}
          onCheckout={() => setPanel('checkout')}
          onKeepShopping={() => setPanel('none')}
        />
      </SlideOver>

      {panel === 'checkout' && (
        <BottomSheet open onClose={() => setPanel('cart')} title="Checkout">
          <PaymentScreen
            items={cart.items}
            subtotal={cart.subtotal}
            onBack={() => setPanel('cart')}
            onOrderPlaced={() => {
              cart.clear();
              setPanel('none');
            }}
          />
        </BottomSheet>
      )}
    </div>
  );
}
