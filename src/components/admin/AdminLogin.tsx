import { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { signIn } from '@/lib/auth';

export function AdminLogin({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signIn(email.trim(), password);
    setBusy(false);
    if (result.ok) {
      onSuccess();
    } else {
      setError(result.error ?? 'Incorrect email or password. Please try again.');
    }
  };

  const field =
    'mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-neutral-50 px-6 py-10 shadow-xl">
      <button onClick={onBack} className="self-start text-xs font-bold text-neutral-500 transition hover:text-neutral-800">
        ← Back to Store
      </button>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 shadow-lg">
          <Lock className="h-7 w-7 text-white" />
        </span>
        <h1 className="mt-5 text-xl font-extrabold text-neutral-900">Merchant Login</h1>
        <p className="mt-1 text-xs text-neutral-500">Sign in to manage orders and your menu.</p>

        <form onSubmit={handleSubmit} className="mt-8 w-full text-left">
          <label htmlFor="admin-email" className="text-xs font-bold uppercase tracking-wide text-neutral-500">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={field}
          />

          <label htmlFor="admin-password" className="mt-4 block text-xs font-bold uppercase tracking-wide text-neutral-500">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={field}
          />

          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-500/25 transition enabled:hover:bg-brand-600 enabled:active:scale-[0.98] disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
