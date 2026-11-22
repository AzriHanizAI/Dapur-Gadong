import { useState } from 'react';
import { Loader2, X } from 'lucide-react';

interface ReceiptModalProps {
  orderId: number;
  imageUrl: string;
  onClose: () => void;
}

export function ReceiptModal({ orderId, imageUrl, onClose }: ReceiptModalProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Receipt for order ${orderId}`}>
      <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl animate-pop">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
          <h3 className="text-sm font-extrabold text-neutral-900">Receipt — Order #ORD-{orderId}</h3>
          <button
            onClick={onClose}
            aria-label="Close receipt"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex min-h-[280px] items-center justify-center bg-neutral-100 p-3">
          {!loaded && <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />}
          <img
            src={imageUrl}
            alt={`Payment receipt for order ORD-${orderId}`}
            onLoad={() => setLoaded(true)}
            className={`max-h-[60vh] w-full rounded-xl object-contain ${loaded ? 'block' : 'hidden'}`}
          />
        </div>
        <div className="px-5 py-3">
          <p className="text-center text-[10px] font-semibold text-neutral-400">
            Verify the transfer amount matches the order total. This link expires in 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
