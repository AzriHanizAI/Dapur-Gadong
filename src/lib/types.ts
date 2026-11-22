export type Category = 'signature' | 'drinks' | 'desserts';

export interface ProductOption {
  id: string;
  label: string;
  priceDelta: number;
}

export interface ProductOptionGroup {
  id: string;
  label: string;
  required?: boolean;
  options: ProductOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image_url: string | null;
  options: ProductOptionGroup[];
  emoji: string;
  accent: string;
  tag: string | null;
  is_available: boolean;
  sort_order: number;
}

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  emoji: string;
  accent: string;
  options: { groupLabel: string; optionLabel: string; priceDelta: number }[];
  notes: string;
  quantity: number;
  unitPrice: number;
}

export type FulfillmentType = 'delivery' | 'pickup';

export type PaymentMethod = 'bibd_quickpay' | 'baiduri_qr' | 'cash_on_delivery';

export type OrderStatus = 'pending' | 'verified' | 'preparing' | 'completed';

export interface DeliveryZone {
  id: string;
  label: string;
  fee: number;
}

export interface OrderRecord {
  order_ref: string | null;
  customer_name: string;
  customer_phone: string;
  fulfillment_type: FulfillmentType;
  area: string | null;
  address: string | null;
  items: {
    name: string;
    options: string;
    notes: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  receipt_url: string | null;
}

export interface OrderRow extends OrderRecord {
  id: string;
  order_number: number;
  status: OrderStatus;
  created_at: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  verified: 'Verified',
  preparing: 'Preparing',
  completed: 'Completed',
};

export const ORDER_STATUS_FLOW: OrderStatus[] = ['pending', 'verified', 'preparing', 'completed'];
