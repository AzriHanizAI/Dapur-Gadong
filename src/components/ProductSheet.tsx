import { useEffect, useState } from 'react';
import { StickyNote } from 'lucide-react';
import { formatBND } from '@/lib/format';
import { resolveUnitPrice } from '@/lib/useCart';
import type { Product } from '@/lib/types';
import { BottomSheet } from './Sheets';
import { QuantityStepper } from './QuantityStepper';

interface ProductSheetProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (input: { product: Product; selectedOptions: Record<string, string>; notes: string; quantity: number }) => void;
}

export function ProductSheet({ product, onClose, onAddToCart }: ProductSheetProps) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (product) {
      const defaults: Record<string, string> = {};
      for (const group of product.options) {
        if (group.required) defaults[group.id] = group.options[0].id;
      }
      setSelected(defaults);
      setNotes('');
      setQuantity(1);
      setShowError(false);
    }
  }, [product]);

  if (!product) return null;

  const allRequiredChosen = product.options
    .filter((g) => g.required)
    .every((g) => selected[g.id]);

  const unitPrice = resolveUnitPrice(product, selected);

  const handleAdd = () => {
    if (!allRequiredChosen) {
      setShowError(true);
      return;
    }
    onAddToCart({ product, selectedOptions: selected, notes, quantity });
  };

  return (
    <BottomSheet open={!!product} onClose={onClose} title="Customize Item">
      <div className="px-5 pb-6">
        {/* Item header */}
        <div className={`mt-4 flex items-center gap-4 rounded-2xl bg-gradient-to-br ${product.accent} p-4 text-white`}>
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/20 text-4xl ring-1 ring-white/25">
            {product.emoji}
          </span>
          <div>
            <h3 className="text-base font-extrabold leading-tight">{product.name}</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-white/85">{product.description}</p>
          </div>
        </div>

        {/* Option groups */}
        {product.options.map((group) => (
          <fieldset key={group.id} className="mt-5">
            <legend className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-neutral-500">
              {group.label}
              {group.required && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-extrabold text-brand-600">Required</span>}
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.options.map((option) => {
                const active = selected[group.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSelected((prev) => ({ ...prev, [group.id]: option.id }));
                      setShowError(false);
                    }}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition active:scale-95 ${
                      active
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    {option.label}
                    {option.priceDelta > 0 && <span className="ml-1 text-[10px] text-neutral-400">+{formatBND(option.priceDelta)}</span>}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        {/* Notes */}
        <div className="mt-5">
          <label htmlFor="notes" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-neutral-500">
            <StickyNote className="h-3.5 w-3.5" />
            Special Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={120}
            placeholder="e.g. less sugar, no onions, extra sambal on the side…"
            className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {showError && !allRequiredChosen && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            Please choose an option for required fields first.
          </p>
        )}

        {/* Footer: quantity + add */}
        <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-3 border-t border-neutral-100 bg-white/95 py-3 backdrop-blur">
          <QuantityStepper quantity={quantity} onChange={(delta) => setQuantity((q) => Math.max(1, q + delta))} />
          <button
            onClick={handleAdd}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 active:scale-[0.98]"
          >
            Add to Cart · {formatBND(unitPrice * quantity)}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
