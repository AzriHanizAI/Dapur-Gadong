import { supabase } from './supabaseClient';
import type { OrderRow, OrderStatus } from './types';

export async function fetchOrders(): Promise<{ ok: true; orders: OrderRow[] } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('order_number', { ascending: false })
    .limit(100);

  if (error) return { ok: false, error: 'Could not load orders. Please refresh.' };
  return { ok: true, orders: (data ?? []) as OrderRow[] };
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<boolean> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  return !error;
}

export async function createReceiptLink(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from('receipts').createSignedUrl(path, 600);
  return data?.signedUrl ?? null;
}

export function subscribeToOrders(onChange: () => void): () => void {
  const channel = supabase
    .channel('orders-dashboard')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
