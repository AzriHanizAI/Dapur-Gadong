interface StepperProps {
  quantity: number;
  onChange: (delta: number) => void;
  min?: number;
  size?: 'sm' | 'md';
}

export function QuantityStepper({ quantity, onChange, min = 1, size = 'md' }: StepperProps) {
  const btn =
    size === 'sm'
      ? 'h-7 w-7 text-sm'
      : 'h-9 w-9 text-base';
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(-1)}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
        className={`${btn} flex items-center justify-center rounded-full border border-neutral-200 bg-white font-bold text-neutral-700 transition enabled:hover:border-brand-400 enabled:hover:text-brand-600 active:scale-90 disabled:opacity-30`}
      >
        −
      </button>
      <span className={`${size === 'sm' ? 'w-5 text-sm' : 'w-6 text-base'} text-center font-extrabold tabular-nums`}>{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(1)}
        aria-label="Increase quantity"
        className={`${btn} flex items-center justify-center rounded-full bg-brand-500 font-bold text-white shadow-sm transition hover:bg-brand-600 active:scale-90`}
      >
        +
      </button>
    </div>
  );
}
