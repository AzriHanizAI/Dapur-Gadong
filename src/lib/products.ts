import { supabase } from './supabaseClient';
import type { Product, ProductOptionGroup } from './types';

export interface NewProductInput {
  name: string;
  description: string;
  price: number;
  category: Product['category'];
  emoji: string;
  accent: string;
}

const GENERIC_ERROR = 'Could not load the menu. Please refresh the page.';

export async function fetchProducts(merchantView: boolean): Promise<{ ok: true; products: Product[] } | { ok: false; error: string }> {
  const query = supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  const { data, error } = merchantView ? await query : await query.eq('is_available', true);
  if (error) return { ok: false, error: GENERIC_ERROR };

  const products: Product[] = (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    image_url: row.image_url ?? null,
    options: (row.options ?? []) as ProductOptionGroup[],
    emoji: row.emoji ?? '🍽️',
    accent: row.accent ?? 'from-amber-500 to-orange-600',
    tag: row.tag ?? null,
    is_available: row.is_available,
    sort_order: row.sort_order ?? 0,
  }));

  return { ok: true, products };
}

export async function toggleProductAvailability(id: string, isAvailable: boolean): Promise<boolean> {
  const { error } = await supabase.from('products').update({ is_available: isAvailable }).eq('id', id);
  return !error;
}

export async function addProduct(input: NewProductInput): Promise<{ ok: boolean; error?: string }> {
  const { count, error: countError } = await supabase.from('products').select('id', { count: 'exact', head: true });
  if (countError) {
    console.error('Could not determine product order', countError);
    return { ok: false, error: 'Could not add the product. Please try again.' };
  }

  const { error } = await supabase.from('products').insert({
    name: input.name.trim(),
    description: input.description.trim(),
    price: input.price,
    category: input.category,
    emoji: input.emoji || '🍽️',
    accent: input.accent,
    options: [],
    is_available: true,
    sort_order: (count ?? 0) + 1,
  });
  if (error) {
    console.error('Could not add product', error);
    return { ok: false, error: 'Could not add the product. Please try again.' };
  }
  return { ok: true };
}
