import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Loader2,
  Truck,
  Wallet,
} from 'lucide-react';
import { formatBND } from '@/lib/format';
import { STORE } from '@/lib/storeData';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { submitOrder } from '@/lib/orders';
import type { CartItem, PaymentMethod } from '@/lib/types';
import { DeliveryForm, EMPTY_DETAILS, type DeliveryDetails } from './DeliveryForm';

interface PaymentScreenProps {
  items: CartItem[];
  subtotal: number;
  onBack: () => void;
  onOrderPlaced: () => void;
}

type Step = 'details' | 'payment';
type Screen = 'form' | 'sending' | 'done';

export function PaymentScreen({ items, subtotal, onBack, onOrderPlaced }: PaymentScreenProps) {
  const [step, setStep] = useState<Step>('details');
  const [details, setDetails] = useState<DeliveryDetails>(EMPTY_DETAILS);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bibd_quickpay');
  const [copied, setCopied] = useState(false);
  const [screen, setScreen] = useState<Screen>('form');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<number | null>(null);

  const deliveryFee = details.fulfillment === 'delivery' ? (details.zone?.fee ?? 0) : 0;
  const total = subtotal + deliveryFee;
  const account = STORE.bankAccounts.bibd_quickpay;

  const areaLabel = useMemo(
    () => (details.zone ? details.zone.label.split(' / ')[0] : null),
    [details.zone]
  );

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSend = async () => {
    setScreen('sending');
    setSubmitError(null);
    const result = await submitOrder({
      items,
      subtotal,
      deliveryFee,
      total,
      customerName: details.name,
      customerPhone: details.phone,
      fulfillmentType: details.fulfillment,
      area: areaLabel,
      address: details.address,
      paymentMethod,
    });
    if (!result.ok) {
      setSubmitError(result.error);
      setScreen('form');
      return;
    }
    setPlacedOrderNumber(result.orderNumber);
    const url = buildWhatsAppUrl({
      customerName: details.name.trim(),
      customerPhone: details.phone,
      fulfillmentType: details.fulfillment,
      area: areaLabel,
      address: details.address.trim(),
      lines: items.map((item) => ({
        quantity: item.quantity,
        name: item.name,
        optionLabels: item.options.map((o) => o.optionLabel),
        lineTotal: item.unitPrice * item.quantity,
      })),
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      orderNumber: result.orderNumber,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
    setScreen('done');
  };

  if (screen === 'done') {
    return (
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-leaf-100 animate-pop">
          <CheckCircle2 className="h-10 w-10 text-leaf-600" />
        </span>
        <h3 className="mt-5 text-lg font-extrabold text-neutral-900">Order Sent!</h3>
        <p className="mt-1 text-xs font-bold text-brand-600">Order #{`ORD-${placedOrderNumber}`}</p>
        <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-neutral-500">
          WhatsApp should have opened with your order ready to send. If you paid by bank transfer, attach your screenshot in the WhatsApp chat so the merchant can verify it.
        </p>
        <button
          onClick={onOrderPlaced}
          className="mt-8 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-neutral-800 active:scale-95"
        >
          Start a New Order
        </button>
      </div>
    );
  }

  if (screen === 'sending') {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <p className="mt-5 text-sm font-bold text-neutral-700">Saving your order…</p>
        <p className="mt-1 text-xs text-neutral-400">WhatsApp will open in a moment.</p>
      </div>
    );
  }

  if (step === 'details') {
    return (
      <div>
        <StepBack label="Delivery Details" onBack={onBack} />
        <DeliveryForm
          subtotal={subtotal}
          details={details}
          onChange={setDetails}
          onContinue={() => setStep('payment')}
        />
      </div>
    );
  }

  return (
    <div className="px-5 pb-6">
      <StepBack label="Payment" onBack={() => setStep('details')} />

      {/* Amount due */}
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-neutral-900 px-5 py-4 text-white">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Amount Due</p>
          <p className="text-2xl font-extrabold tabular-nums">{formatBND(total)}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold ring-1 ring-white/15">
          <Truck className="h-3 w-3" />
          {details.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}
        </span>
      </div>

      {/* Payment method */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setPaymentMethod('bibd_quickpay')}
          className={`rounded-2xl border px-3 py-3 text-left transition active:scale-[0.98] ${
            paymentMethod === 'bibd_quickpay'
              ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <p className="text-xs font-extrabold text-neutral-900">BIBD QuickPay</p>
          <p className="mt-1 text-[10px] font-semibold text-neutral-400">Pay by bank transfer</p>
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod('cash_on_delivery')}
          className={`rounded-2xl border px-3 py-3 text-left transition active:scale-[0.98] ${
            paymentMethod === 'cash_on_delivery'
              ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <p className="flex items-center gap-1.5 text-xs font-extrabold text-neutral-900">
            <Wallet className="h-3.5 w-3.5 text-brand-500" />
            Cash on Delivery
          </p>
          <p className="mt-1 text-[10px] font-semibold text-neutral-400">Pay when received</p>
        </button>
      </div>

      {paymentMethod === 'bibd_quickpay' ? (
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="flex h-44 w-44 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 text-center">
              <div className="px-3">
                <div className="mx-auto grid grid-cols-5 gap-1" aria-hidden>
                  {Array.from({ length: 25 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-4 w-4 rounded-[3px] ${
                        [0, 1, 4, 6, 9, 12, 14, 16, 18, 20, 22, 24, 2, 7, 11, 17].includes(i)
                          ? 'bg-neutral-800'
                          : 'bg-neutral-300/50'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-[9px] font-bold uppercase tracking-wide text-neutral-400">Scan in BIBD QuickPay</p>
              </div>
            </div>
            <div className="mt-4 w-full rounded-xl bg-neutral-50 px-4 py-3 ring-1 ring-neutral-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Account Name</span>
                <span className="font-bold text-neutral-900">{account.accountName}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Account No.</span>
                <span className="font-bold tabular-nums text-neutral-900">{account.accountNumber}</span>
              </div>
            </div>
            <button
              onClick={copyAccount}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold transition active:scale-[0.98] ${
                copied ? 'bg-leaf-500 text-white' : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Account No.'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-center ring-1 ring-brand-100">
          <p className="text-xs font-bold text-brand-800">Pay with cash when your order arrives.</p>
          <p className="mt-1 text-[10px] font-semibold text-brand-600">No transfer screenshot is needed.</p>
        </div>
      )}

      {submitError && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{submitError}</p>
      )}

      {/* Send */}
      <button
        onClick={handleSend}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-600 px-4 py-4 text-sm font-extrabold text-white shadow-lg shadow-leaf-600/25 transition hover:bg-leaf-700 active:scale-[0.98]"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12.001 2c-5.523 0-10 4.477-10 10 0 1.762.46 3.42 1.264 4.86L2 22l5.275-1.233A9.94 9.94 0 0 0 12.001 22c5.523 0 10-4.477 10-10s-4.477-10-10-10Zm0 18.2a8.17 8.17 0 0 1-4.166-1.14l-.3-.18-3.116.729.73-3.04-.196-.314A8.176 8.176 0 0 1 3.801 12c0-4.522 3.678-8.2 8.2-8.2s8.2 3.678 8.2 8.2-3.678 8.2-8.2 8.2Zm4.505-6.146c-.247-.124-1.458-.72-1.684-.802-.226-.083-.39-.124-.555.124-.164.247-.637.802-.78.966-.144.165-.287.186-.534.062-.247-.124-.931-.343-1.774-1.095-.655-.585-1.098-1.307-1.227-1.554-.124-.247-.013-.381.108-.504.111-.111.247-.287.37-.43.124-.144.165-.248.248-.412.082-.165.041-.31-.021-.434-.062-.124-.555-1.338-.761-1.832-.2-.482-.404-.417-.555-.424h-.472c-.165 0-.433.062-.66.31-.226.247-.863.843-.863 2.056s.884 2.385 1.007 2.55c.124.165 1.737 2.652 4.208 3.72.588.254 1.047.405 1.405.518.59.188 1.127.161 1.552.098.473-.071 1.458-.596 1.663-1.172.206-.576.206-1.069.145-1.173-.062-.103-.227-.165-.474-.289Z" />
        </svg>
        Send Order via WhatsApp
      </button>
      <p className="mt-2 text-center text-[11px] font-semibold text-neutral-400">
        Bank transfer customers can attach their screenshot in WhatsApp after sending.
      </p>
    </div>
  );
}

function StepBack({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-3">
      <button
        onClick={onBack}
        aria-label="Go back"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 active:scale-90"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <h3 className="text-sm font-extrabold text-neutral-900">{label}</h3>
    </div>
  );
}
