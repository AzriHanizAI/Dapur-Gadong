import { STORE } from './storeData';
import type { FulfillmentType, PaymentMethod } from './types';

export interface WhatsAppPayload {
  customerName: string;
  customerPhone: string;
  fulfillmentType: FulfillmentType;
  area: string | null;
  address: string | null;
  lines: { quantity: number; name: string; optionLabels: string[]; lineTotal: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  orderNumber: number;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  bibd_quickpay: 'BIBD QuickPay',
  baiduri_qr: 'Baiduri QR',
  cash_on_delivery: 'Cash on Delivery/Pickup',
};

export function buildWhatsAppMessage(p: WhatsAppPayload): string {
  const divider = '-------------------';

  const lines: string[] = [];
  lines.push(`*NEW ORDER #ORD-${p.orderNumber} - ${STORE.name.toUpperCase()}*`);
  lines.push(`Customer: ${p.customerName} (+673 ${p.customerPhone})`);
  lines.push(`Type: ${p.fulfillmentType === 'delivery' ? 'Delivery' : 'Self-Pickup (Gadong)'}`);
  if (p.fulfillmentType === 'delivery') {
    lines.push(`Area: ${p.area ?? '-'}`);
    lines.push(`Address: ${p.address ?? '-'}`);
  }
  lines.push(divider);
  for (const line of p.lines) {
    const options = line.optionLabels.length > 0 ? ` (${line.optionLabels.join(', ')})` : '';
    lines.push(`${line.quantity}x ${line.name}${options} - BND ${line.lineTotal.toFixed(2)}`);
  }
  lines.push(divider);
  lines.push(`Subtotal: BND ${p.subtotal.toFixed(2)}`);
  lines.push(`Delivery: BND ${p.deliveryFee.toFixed(2)}`);
  lines.push(`*TOTAL: BND ${p.total.toFixed(2)}*`);
  lines.push(`Payment: ${PAYMENT_LABELS[p.paymentMethod]}`);
  lines.push('');
  lines.push('*If you paid by bank transfer, please attach your transfer screenshot in this WhatsApp chat.');

  return lines.join('\n');
}

export function buildWhatsAppUrl(p: WhatsAppPayload): string {
  const message = buildWhatsAppMessage(p);
  return `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
