import { useCallback, useMemo, useState } from 'react';
import type { CartItem, Product } from './types';

export interface AddToCartInput {
  product: Product;
  selectedOptions: Record<string, string>;
  notes: string;
  quantity: number;
}

function itemKey(productId: string, selectedOptions: Record<string, string>, notes: string): string {
  const optionSig = Object.keys(selectedOptions)
    .sort()
    .map((groupId) => `${groupId}:${selectedOptions[groupId]}`)
    .join('|');
  return `${productId}__${optionSig}__${notes.trim().toLowerCase()}`;
}

export function resolveUnitPrice(product: Product, selectedOptions: Record<string, string>): number {
  let price = product.price;
  for (const group of product.options) {
    const chosenId = selectedOptions[group.id];
    if (!chosenId) continue;
    const option = group.options.find((o) => o.id === chosenId);
    if (option) price += option.priceDelta;
  }
  return price;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback(({ product, selectedOptions, notes, quantity }: AddToCartInput) => {
    setItems((prev) => {
      const key = itemKey(product.id, selectedOptions, notes);
      const unitPrice = resolveUnitPrice(product, selectedOptions);

      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      const options = product.options
        .filter((group) => selectedOptions[group.id])
        .map((group) => {
          const option = group.options.find((o) => o.id === selectedOptions[group.id])!;
          return { groupLabel: group.label, optionLabel: option.label, priceDelta: option.priceDelta };
        });

      const next: CartItem = {
        key,
        productId: product.id,
        name: product.name,
        emoji: product.emoji,
        accent: product.accent,
        options,
        notes: notes.trim(),
        quantity,
        unitPrice,
      };
      return [...prev, next];
    });
  }, []);

  const updateQuantity = useCallback((key: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => (item.key === key ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return { items, addItem, updateQuantity, removeItem, clear, subtotal, itemCount };
}
