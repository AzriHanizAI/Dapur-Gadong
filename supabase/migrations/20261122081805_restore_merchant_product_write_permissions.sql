/*
# Restore merchant product management permissions

1. Purpose
The previous security tightening removed the merchant's INSERT and UPDATE
privileges on `products`, while the existing dashboard policies still expected
those operations. This caused the Add Product form and availability switches to
fail with a generic error.

2. Modified Tables
- `products`
  - Restore INSERT for authenticated merchant sessions so the Add Product form
    can create menu items.
  - Restore UPDATE for authenticated merchant sessions so availability toggles
    can mark products sold out or available.
  - No DELETE permission is added; the dashboard does not delete products.

3. Security
- Anonymous customers retain SELECT access only.
- Authenticated merchant access remains controlled by the existing
  `merchant_insert_products` and `merchant_update_products` RLS policies.
- No new tables, columns, or public data access are introduced.
*/

GRANT INSERT ON products TO authenticated;
GRANT UPDATE ON products TO authenticated;