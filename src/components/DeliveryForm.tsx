import { useMemo, useState } from 'react';
import { Bike, Store } from 'lucide-react';
import { formatBND } from '@/lib/format';
import { DELIVERY_ZONES } from '@/lib/storeData';
import type { CartItem, DeliveryZone, FulfillmentType } from '@/lib/types';

export interface DeliveryDetails {
  fulfillment: FulfillmentType;
  zone: DeliveryZone | null;
  name: string;
  phone: string;
  address: string;
}

export const EMPTY_DETAILS: DeliveryDetails = {
  fulfillment: 'delivery',
  zone: null,
  name: '',
  phone: '',
  address: '',
};

interface DeliveryFormProps {
  subtotal: number;
  details: DeliveryDetails;
  onChange: (details: DeliveryDetails) => void;
  onContinue: () => void;
}

export function DeliveryForm({ subtotal, details, onChange, onContinue }: DeliveryFormProps) {
  const [touched, setTouched] = useState(false);

  const fee = details.fulfillment === 'delivery' ? (details.zone?.fee ?? 0) : 0;
  const total = subtotal + fee;

  const phoneDigits = details.phone.replace(/\D/g, '');
  const errors = useMemo(() => {
    const e: Partial<Record<keyof DeliveryDetails | 'phone', string>> = {};
    if (!details.name.trim()) e.name = 'Please enter your name.';
    if (details.fulfillment === 'delivery') {
      if (!details.zone) e.zone = 'Please choose your area.';
      if (!details.address.trim()) e.address = 'Please enter your address or simpang number.';
    }
    if (phoneDigits.length < 7) e.phone = 'Enter a valid Brunei phone number (7 digits).';
    return e;
  }, [details, phoneDigits]);

  const isValid = Object.keys(errors).length === 0;

  const handleContinue = () => {
    if (!isValid) {
      setTouched(true);
      return;
    }
    onContinue();
  };

  const field = (invalid: boolean) =>
    `mt-2 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition ${
      invalid && touched ? 'border-red-400 focus:ring-red-100' : 'border-neutral-200 focus:border-brand-500 focus:ring-brand-100'
    }`;

  return (
    <div className="px-5 pb-6">
      {/* Fulfillment toggle */}
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-neutral-100 p-1.5">
        {(
          [
            { id: 'delivery', label: 'Delivery', icon: Bike },
            { id: 'pickup', label: 'Self-Pickup (Gadong)', icon: Store },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange({ ...details, fulfillment: id })}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition active:scale-[0.98] ${
              details.fulfillment === id ? 'bg-white text-neutral-900 shadow-md' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Customer fields */}
      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="co-name" className="text-xs font-bold uppercase tracking-wide text-neutral-500">Your Name</label>
          <input
            id="co-name"
            type="text"
            value={details.name}
            onChange={(e) => onChange({ ...details, name: e.target.value })}
            placeholder="e.g. Nurul Aisyah"
            className={field(!!errors.name)}
          />
          {touched && errors.name && <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="co-phone" className="text-xs font-bold uppercase tracking-wide text-neutral-500">Phone Number</label>
          <div className={`mt-2 flex items-center overflow-hidden rounded-xl border bg-white transition ${touched && errors.phone ? 'border-red-400' : 'border-neutral-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100'}`}>
            <span className="border-r border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm font-bold text-neutral-600">+673</span>
            <input
              id="co-phone"
              type="tel"
              inputMode="numeric"
              value={details.phone}
              onChange={(e) => onChange({ ...details, phone: e.target.value.replace(/\D/g, '').slice(0, 7) })}
              placeholder="7-digit number"
              className="w-full px-3.5 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none"
            />
          </div>
          {touched && errors.phone && <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.phone}</p>}
        </div>

        {details.fulfillment === 'delivery' && (
          <>
            <div>
              <label htmlFor="co-zone" className="text-xs font-bold uppercase tracking-wide text-neutral-500">District / Area</label>
              <select
                id="co-zone"
                value={details.zone?.id ?? ''}
                onChange={(e) => {
                  const zone = DELIVERY_ZONES.find((z) => z.id === e.target.value) ?? null;
                  onChange({ ...details, zone });
                }}
                className={field(!!errors.zone) + ' appearance-none'}
              >
                <option value="" disabled>
                  Choose your area…
                </option>
                {DELIVERY_ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label} — +{formatBND(z.fee)}
                  </option>
                ))}
              </select>
              {touched && errors.zone && <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.zone}</p>}
            </div>

            <div>
              <label htmlFor="co-address" className="text-xs font-bold uppercase tracking-wide text-neutral-500">Full Address / Simpang No.</label>
              <textarea
                id="co-address"
                rows={2}
                value={details.address}
                onChange={(e) => onChange({ ...details, address: e.target.value })}
                placeholder="House no, street, simpang, landmark…"
                className={field(!!errors.address) + ' resize-none'}
              />
              {touched && errors.address && <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.address}</p>}
            </div>
          </>
        )}
      </div>

      {/* Totals */}
      <div className="mt-6 rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-100">
        <div className="flex items-center justify-between text-sm font-semibold text-neutral-600">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatBND(subtotal)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-sm font-semibold text-neutral-600">
          <span>{details.fulfillment === 'delivery' ? 'Delivery fee' : 'Pickup'}</span>
          <span className="tabular-nums">{formatBND(fee)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3">
          <span className="text-sm font-extrabold text-neutral-900">Total</span>
          <span className="text-lg font-extrabold tabular-nums text-brand-600">{formatBND(total)}</span>
        </div>
      </div>

      <button
        onClick={handleContinue}
        className="mt-5 w-full rounded-xl bg-brand-500 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 active:scale-[0.98]"
      >
        Continue to Payment
      </button>
    </div>
  );
}
