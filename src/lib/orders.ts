import { supabase } from './supabaseClient';
import { normalizePhone } from './format';
import type { CartItem, FulfillmentType, OrderRecord, PaymentMethod } from './types';

export interface SubmitOrderInput {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  customerPhone: string;
  fulfillmentType: FulfillmentType;
  area: string | null;
  address: string | null;
  paymentMethod: PaymentMethod;
}

export async function submitOrder(
  input: SubmitOrderInput
): Promise<{ ok: true; orderNumber: number } | { ok: false; error: string }> {
  try {
    const record: OrderRecord = {
      order_ref: null,
      customer_name: input.customerName.trim(),
      customer_phone: normalizePhone(input.customerPhone),
      fulfillment_type: input.fulfillmentType,
      area: input.fulfillmentType === 'delivery' ? input.area : null,
      address: input.fulfillmentType === 'delivery' ? (input.address ?? '').trim() || null : null,
      items: input.items.map((item) => ({
        name: item.name,
        options: item.options.map((o) => o.optionLabel).join(', '),
        notes: item.notes,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.unitPrice * item.quantity,
      })),
      subtotal: input.subtotal,
      delivery_fee: input.deliveryFee,
      total_amount: input.total,
      payment_method: input.paymentMethod,
      receipt_url: null,
    };

    const { data, error } = await supabase.rpc('create_order', { p_order: record });

    if (error || typeof data !== 'number') {
      return { ok: false, error: 'Could not save your order. Please try again in a moment.' };
    }

    return { ok: true, orderNumber: data };
  } catch {
    return { ok: false, error: 'Something went wrong while saving your order. Please try again.' };
  }
}
