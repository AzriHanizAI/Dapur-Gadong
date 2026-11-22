import { ChevronLeft, Trash2 } from 'lucide-react';
import { formatBND } from '@/lib/format';
import type { CartItem } from '@/lib/types';
import { QuantityStepper } from './QuantityStepper';

interface CartPanelProps {
  items: CartItem[];
  subtotal: number;
  updateQuantity: (key: string, delta: number) => void;
  removeItem: (key: string) => void;
  onCheckout: () => void;
  onKeepShopping: () => void;
}

export function CartPanel({ items, subtotal, updateQuantity, removeItem, onCheckout, onKeepShopping }: CartPanelProps) {
  return (
    <div className="flex min-h-full flex-col">
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-24 text-center">
          <span className="text-5xl">🛒</span>
          <p className="text-sm font-bold text-neutral-700">Your cart is empty</p>
          <p className="text-xs leading-relaxed text-neutral-400">Add some delicious items from the menu to get started.</p>
          <button
            onClick={onKeepShopping}
            className="mt-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 active:scale-95"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-neutral-100 px-4">
            {items.map((item) => (
              <li key={item.key} className="flex gap-3 py-4">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} text-2xl`}>
                  {item.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold leading-snug text-neutral-900">{item.name}</h4>
                    <button
                      onClick={() => removeItem(item.key)}
                      aria-label={`Remove ${item.name}`}
                      className="shrink-0 rounded-lg p-1.5 text-neutral-300 transition hover:bg-red-50 hover:text-red-500 active:scale-90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {item.options.length > 0 && (
                    <p className="mt-0.5 text-[11px] text-neutral-500">{item.options.map((o) => o.optionLabel).join(' · ')}</p>
                  )}
                  {item.notes && <p className="mt-0.5 text-[11px] italic text-neutral-400">“{item.notes}”</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <QuantityStepper size="sm" quantity={item.quantity} onChange={(delta) => updateQuantity(item.key, delta)} min={1} />
                    <span className="text-sm font-extrabold tabular-nums text-neutral-900">{formatBND(item.unitPrice * item.quantity)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-auto sticky bottom-0 border-t border-neutral-200 bg-white px-5 py-4 pb-safe">
            <div className="flex items-center justify-between text-sm font-semibold text-neutral-600">
              <span>Subtotal</span>
              <span className="tabular-nums text-neutral-900">{formatBND(subtotal)}</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-400">Delivery fee is calculated at checkout based on your area.</p>
            <button
              onClick={onCheckout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 active:scale-[0.98]"
            >
              Continue to Checkout
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
