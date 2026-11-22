interface ProductCardProps {
  name: string;
  description: string;
  price: string;
  emoji: string;
  accent: string;
  tag?: string;
  onClick: () => void;
}

export function ProductCard({ name, description, price, emoji, accent, tag, onClick }: ProductCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-stretch gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-neutral-100 transition hover:shadow-md hover:ring-brand-200 active:scale-[0.98]"
    >
      <div className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${accent} text-4xl`}>
        <span aria-hidden>{emoji}</span>
        {tag && (
          <span className="absolute left-0 top-0 rounded-br-lg bg-neutral-900/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            {tag}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="truncate text-sm font-bold text-neutral-900">{name}</h3>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-neutral-500">{description}</p>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-sm font-extrabold text-brand-600">{price}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white shadow transition group-hover:bg-brand-600 group-active:scale-90">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}
