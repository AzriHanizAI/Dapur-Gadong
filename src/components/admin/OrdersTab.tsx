import { useEffect, useState } from 'react';
import { CircleAlert, Image as ImageIcon } from 'lucide-react';
import { formatBND } from '@/lib/format';
import { STORE } from '@/lib/storeData';
import { createReceiptLink, updateOrderStatus } from '@/lib/adminOrders';
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, type OrderRow, type OrderStatus } from '@/lib/types';
import { ReceiptModal } from './ReceiptModal';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  verified: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  completed: 'bg-leaf-100 text-leaf-800',
};

const PAYMENT_LABELS: Record<string, string> = {
  bibd_quickpay: 'BIBD QuickPay',
  baiduri_qr: 'Baiduri QR',
  cash_on_delivery: 'Cash',
};

interface OrdersTabProps {
  orders: OrderRow[];
  loading: boolean;
  error: string | null;
  onStatusChanged: (id: string, status: OrderStatus) => void;
}

export function OrdersTab({ orders, loading, error, onStatusChanged }: OrdersTabProps) {
  const [receiptView, setReceiptView] = useState<{ order: OrderRow; url: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const handleStatus = async (order: OrderRow, status: OrderStatus) => {
    setStatusError(null);
    setUpdatingId(order.id);
    const ok = await updateOrderStatus(order.id, status);
    setUpdatingId(null);

    if (ok) {
      onStatusChanged(order.id, status);
    } else {
      setStatusError(`Could not update ${order.order_number ? `#ORD-${order.order_number}` : 'this order'}. Please try again.`);
    }
  };

  const openReceipt = async (order: OrderRow) => {
    if (!order.receipt_url) return;
    const url = await createReceiptLink(order.receipt_url);
    if (url) setReceiptView({ order, url });
  };

  if (loading) {
    return <p className="px-5 py-10 text-center text-xs font-semibold text-neutral-400">Loading orders…</p>;
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

  if (orders.length === 0) {
    return <p className="px-5 py-14 text-center text-xs font-semibold text-neutral-400">No orders yet. New orders appear here automatically.</p>;
  }

  return (
    <div className="space-y-3 px-4 py-4">
      {statusError && <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">{statusError}</p>}

      {orders.map((order) => (
        <article key={order.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-neutral-900">#ORD-{order.order_number}</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                {new Date(order.created_at).toLocaleString('en-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${STATUS_STYLES[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>

          {/* Customer */}
          <div className="mt-3 rounded-xl bg-neutral-50 px-3.5 py-3 text-xs leading-relaxed text-neutral-600">
            <p>
              <span className="font-bold text-neutral-900">{order.customer_name}</span> · +673 {order.customer_phone}
            </p>
            <p className="mt-0.5">
              {order.fulfillment_type === 'delivery' ? `Delivery — ${order.area}` : 'Self-Pickup (Gadong)'}
              {order.address && <span className="text-neutral-400"> · {order.address}</span>}
            </p>
            <p className="mt-0.5 text-neutral-400">{PAYMENT_LABELS[order.payment_method]}</p>
          </div>

          {/* Items */}
          <ul className="mt-3 space-y-1.5">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-neutral-700">
                  <span className="font-bold text-neutral-900">{item.quantity}×</span> {item.name}
                  {item.options && <span className="text-neutral-400"> ({item.options})</span>}
                  {item.notes && <span className="italic text-neutral-400"> — “{item.notes}”</span>}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-neutral-900">{formatBND(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          {/* Totals */}
          <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
            <span className="text-neutral-500">
              Subtotal {formatBND(Number(order.subtotal))} + Fee {formatBND(Number(order.delivery_fee))}
            </span>
            <span className="text-sm font-extrabold tabular-nums text-brand-600">{formatBND(Number(order.total_amount))}</span>
          </div>

          {/* Receipt + status controls */}
          <div className="mt-3 flex items-center justify-between gap-3">
            {order.receipt_url ? (
              <button
                onClick={() => openReceipt(order)}
                className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] font-bold text-neutral-700 transition hover:border-brand-400 hover:text-brand-600 active:scale-95"
              >
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
                  <ImageIcon className="h-4 w-4 text-neutral-400" />
                </span>
                View Receipt
              </button>
            ) : (
              <span className="flex items-center gap-2 text-[11px] font-semibold text-neutral-300">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                  <ImageIcon className="h-4 w-4 text-neutral-300" />
                </span>
                Receipt sent in WhatsApp
              </span>
            )}

            <select
              value={order.status}
              disabled={updatingId === order.id}
              onChange={(e) => handleStatus(order, e.target.value as OrderStatus)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] font-bold text-neutral-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
            >
              {ORDER_STATUS_FLOW.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </article>
      ))}

      {receiptView && (
        <ReceiptModal orderId={receiptView.order.order_number} imageUrl={receiptView.url} onClose={() => setReceiptView(null)} />
      )}
    </div>
  );
}
