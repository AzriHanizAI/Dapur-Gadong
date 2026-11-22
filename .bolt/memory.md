# Project memory

## Product intent & audience

- Food ordering storefront for **Dapur Gadong** (Brunei-based; references BIBD/Baiduri bank transfers).
- Customers browse a menu, build an order, upload a payment receipt screenshot, and submit the order via WhatsApp.
- A lightweight **Merchant Admin Dashboard** (auth-gated) lets the merchant track orders, verify receipts, and manage product availability.

## Brand personality & voice

- Production-quality, beautiful, not cookie-cutter (per authoritative `.bolt/prompt`).
- Customer-facing tone is straightforward and transactional; admin UI is utilitarian and clear.

## Visual design & UX direction

- Stack: Vite + React (JSX), Tailwind CSS, Lucide React icons, React hooks. No extra UI/icon packages unless explicitly requested.
- Import convention: `@/` path alias → `src/` (e.g. `@/components/Foo`); avoid deep relative paths.
- Storefront reads products dynamically from Supabase `products` table (replaces prior hardcoded ~9 item menu).
- Footer contains a subtle "Merchant Login" link beneath payment info.
- Checkout flow: upload receipt → save order → open WhatsApp with order ID on the first line.
- Merchant dashboard: two tabs (Orders, Products). Orders tab shows live-updating list, itemized details, receipt thumbnail → large preview modal, and a status dropdown (Pending → Verified → Preparing → Completed). Products tab has availability toggle + "Add Product" form.
- Admin views toggle within the app; login uses Supabase email/password auth with session persistence.

## Decisions, constraints & rationale

- Supabase backend: PostgreSQL (`products`, `orders` tables), Storage (`receipts` bucket), Auth (merchant login).
- `orders` table columns: id, order_number, customer_name, customer_phone, fulfillment_type, area, address, items (jsonb), subtotal, delivery_fee, total_amount, payment_method, receipt_url, status, created_at.
- `products` table columns: id, name, description, price, category, image_url, options (jsonb), is_available (boolean).
- Order numbers are sequential, server/DB-generated (e.g. `#ORD-101`) to guarantee uniqueness under concurrency.
- RLS planned: customer order data and receipts visible only to signed-in merchant; anonymous order insertion still allowed for customers.
- Receipts bucket recommended private with expiring signed URLs for the receipt modal (final decision pending user confirmation vs. public bucket).

## Open questions & assumptions

- Merchant account email/password not yet provided (placeholder may be created for later change in Supabase dashboard).
- Order number start/format (`#ORD-101` from 101) proposed but unconfirmed.
- Receipts bucket: private + expiring links (recommended) vs. fully public — awaiting user choice.
- Plan mode response only; implementation pending switch to build mode and answers to the three questions above.