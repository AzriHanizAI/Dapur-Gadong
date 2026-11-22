import { useState } from 'react';
import { CircleAlert, Plus, X } from 'lucide-react';
import { formatBND } from '@/lib/format';
import { addProduct, toggleProductAvailability } from '@/lib/products';
import type { Product } from '@/lib/types';

const EMOJI_CHOICES = ['🍽️', '🍗', '🍚', '🍜', '🍳', '🥤', '🍋', '🥛', '🍰', '🍮', '🧋', '🍛'];
const ACCENT_CHOICES = [
  'from-amber-500 to-orange-600',
  'from-lime-500 to-green-600',
  'from-red-500 to-rose-600',
  'from-orange-400 to-amber-500',
  'from-green-400 to-emerald-500',
  'from-pink-400 to-rose-500',
  'from-stone-500 to-amber-800',
];

interface ProductsTabProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onProductAvailabilityChanged: (id: string, isAvailable: boolean) => void;
}

export function ProductsTab({ products, loading, error, onRefresh, onProductAvailabilityChanged }: ProductsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleToggle = async (product: Product) => {
    const nextAvailability = !product.is_available;
    setActionError(null);
    setUpdatingId(product.id);
    onProductAvailabilityChanged(product.id, nextAvailability);

    const ok = await toggleProductAvailability(product.id, nextAvailability);
    setUpdatingId(null);

    if (!ok) {
      onProductAvailabilityChanged(product.id, product.is_available);
      setActionError('Could not update product availability. Please try again.');
    }
  };

  if (loading) {
    return <p className="px-5 py-10 text-center text-xs font-semibold text-neutral-400">Loading products…</p>;
  }

  if (error) {
    return (
      <div className="px-5 py-6">
        <p className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
          <CircleAlert className="h-4 w-4 shrink-0" />
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <button
        onClick={() => setShowForm(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-xs font-extrabold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" />
        Add Product
      </button>

      {actionError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">{actionError}</p>}

      <ul className="mt-4 space-y-2.5">
        {products.map((product) => (
          <li key={product.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-neutral-100">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${product.accent} text-2xl ${product.is_available ? '' : 'opacity-40'}`}>
              {product.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-bold ${product.is_available ? 'text-neutral-900' : 'text-neutral-400 line-through'}`}>
                {product.name}
              </p>
              <p className="text-[11px] font-semibold text-neutral-400">
                {formatBND(product.price)} · {product.category}
              </p>
            </div>
            <button
              onClick={() => handleToggle(product)}
              disabled={updatingId === product.id}
              role="switch"
              aria-checked={product.is_available}
              aria-label={`${product.is_available ? 'Mark sold out' : 'Mark available'}: ${product.name}`}
              className={`relative h-7 w-12 shrink-0 rounded-full transition active:scale-95 ${
                product.is_available ? 'bg-leaf-500' : 'bg-neutral-300'
              } ${updatingId === product.id ? 'cursor-wait opacity-60' : ''}`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  product.is_available ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>

      {showForm && <AddProductForm onClose={() => setShowForm(false)} onAdded={onRefresh} />}
    </div>
  );
}

function AddProductForm({ onClose, onAdded }: { onClose: () => void; onAdded: () => Promise<void> | void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Product['category']>('signature');
  const [emoji, setEmoji] = useState('🍽️');
  const [accent, setAccent] = useState(ACCENT_CHOICES[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    if (!name.trim() || !description.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please fill in a name, description, and a price above zero.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await addProduct({ name, description, price: parsedPrice, category, emoji, accent });
    setBusy(false);
    if (result.ok) {
      await onAdded();
      onClose();
    } else {
      setError(result.error ?? 'Could not add the product. Please try again.');
    }
  };

  const field =
    'mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Add product">
      <div className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[480px] max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-neutral-900">Add Product</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <label htmlFor="np-name" className="text-xs font-bold uppercase tracking-wide text-neutral-500">Name</label>
          <input id="np-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Roti Jala Pandan" className={field} />

          <label htmlFor="np-desc" className="mt-3 block text-xs font-bold uppercase tracking-wide text-neutral-500">Description</label>
          <textarea
            id="np-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short appetizing description…"
            className={`${field} resize-none`}
          />

          <label htmlFor="np-price" className="mt-3 block text-xs font-bold uppercase tracking-wide text-neutral-500">Price (BND)</label>
          <input
            id="np-price"
            type="number"
            step="0.10"
            min="0.10"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="4.50"
            className={field}
          />

          <label htmlFor="np-cat" className="mt-3 block text-xs font-bold uppercase tracking-wide text-neutral-500">Category</label>
          <select id="np-cat" value={category} onChange={(e) => setCategory(e.target.value as Product['category'])} className={`${field} appearance-none`}>
            <option value="signature">Signature Dishes</option>
            <option value="drinks">Drinks</option>
            <option value="desserts">Desserts</option>
          </select>

          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-neutral-500">Icon</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border text-lg transition active:scale-90 ${
                  emoji === e ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-neutral-200 bg-white'
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-neutral-500">Card Color</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {ACCENT_CHOICES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAccent(a)}
                aria-label={`Choose color ${a}`}
                className={`h-9 w-9 rounded-xl bg-gradient-to-br ${a} transition active:scale-90 ${
                  accent === a ? 'ring-2 ring-neutral-900 ring-offset-2' : ''
                }`}
              />
            ))}
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full rounded-xl bg-brand-500 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-500/25 transition enabled:hover:bg-brand-600 enabled:active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? 'Adding…' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
