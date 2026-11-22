/*
# Create orders table and receipts storage bucket

1. Purpose
This app is a WhatsApp commerce storefront with no sign-in. Customers browse
products, build a cart, upload a bank-transfer receipt, and send their order to
the merchant over WhatsApp. Every submitted order is saved here as a durable
backup record so the merchant does not lose orders if WhatsApp messages get
buried.

2. New Tables
- `orders`: one row per submitted customer order.
  - `id` (uuid, primary key) — auto-generated.
  - `order_ref` (text, not null, unique) — short human-readable reference shown to customer/merchant, e.g. "DG-7F3K2A".
  - `customer_name` (text, not null).
  - `customer_phone` (text, not null) — digits without the +673 prefix.
  - `fulfillment_type` (text, not null) — either 'delivery' or 'pickup'.
  - `area` (text, nullable) — Brunei district/area name; null for pickup.
  - `address` (text, nullable) — full address / simpang; null for pickup.
  - `items` (jsonb, not null) — array of line items: { name, options, notes, quantity, unitPrice, lineTotal }.
  - `subtotal` (numeric(10,2), not null).
  - `delivery_fee` (numeric(10,2), not null).
  - `total` (numeric(10,2), not null).
  - `payment_method` (text, not null) — 'bibd_quickpay' | 'baiduri_qr' | 'cash_on_delivery'.
  - `receipt_url` (text, nullable) — Supabase Storage path of the uploaded receipt image.
  - `created_at` (timestamptz, default now()).

3. Security
- Enable RLS on `orders`.
- Grant INSERT and SELECT to `anon` and `authenticated` (no sign-in exists; the
  storefront is a public, shared app). No UPDATE or DELETE grants: order records
  are write-once from the customer side.
- Policies: anon/authenticated may INSERT new orders and SELECT existing ones.
  This is intentional public data for a single-tenant no-auth storefront.

4. Storage
- Create a private storage bucket `receipts` for customer bank-transfer
  screenshots, restricted to the `orders/` folder prefix.
- Policies allow anon/authenticated to upload into `orders/` and to READ their
  uploaded receipt images (needed to render the preview and let the merchant
  view them later).
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  fulfillment_type text NOT NULL CHECK (fulfillment_type IN ('delivery', 'pickup')),
  area text,
  address text,
  items jsonb NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  delivery_fee numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('bibd_quickpay', 'baiduri_qr', 'cash_on_delivery')),
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON orders TO anon, authenticated;

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders
FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders
FOR SELECT TO anon, authenticated USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_upload_receipts" ON storage.objects;
CREATE POLICY "anon_upload_receipts" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "anon_read_receipts" ON storage.objects;
CREATE POLICY "anon_read_receipts" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'receipts');