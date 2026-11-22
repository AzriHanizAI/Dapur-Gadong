/*
# Fix create_order function: replace bad fulfillment check

The previous version of create_order called a non-existent helper
(v_fulfillment_check) inside the function body, which would fail at runtime.
This replaces the function with the correct inline check.
*/

CREATE OR REPLACE FUNCTION public.create_order(p_order jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_items jsonb;
  v_item jsonb;
  v_sum numeric(10,2) := 0;
  v_subtotal numeric(10,2);
  v_delivery_fee numeric(10,2);
  v_total numeric(10,2);
  v_order_number integer;
BEGIN
  IF p_order->>'fulfillment_type' NOT IN ('delivery', 'pickup') THEN
    RAISE EXCEPTION 'Invalid fulfillment type';
  END IF;

  IF p_order->>'payment_method' NOT IN ('bibd_quickpay', 'baiduri_qr', 'cash_on_delivery') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  IF COALESCE(trim(p_order->>'customer_name'), '') = '' OR COALESCE(trim(p_order->>'customer_phone'), '') = '' THEN
    RAISE EXCEPTION 'Missing customer details';
  END IF;

  v_items := p_order->'items';
  IF jsonb_typeof(v_items) <> 'array'
     OR jsonb_array_length(v_items) = 0
     OR jsonb_array_length(v_items) > 50 THEN
    RAISE EXCEPTION 'Invalid items';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items) LOOP
    IF COALESCE((v_item->>'quantity')::int, 0) < 1 OR (v_item->>'quantity')::int > 100 THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;
    IF COALESCE((v_item->>'unitPrice')::numeric, -1) < 0 OR (v_item->>'unitPrice')::numeric > 1000 THEN
      RAISE EXCEPTION 'Invalid price';
    END IF;
    v_sum := v_sum + (v_item->>'unitPrice')::numeric * (v_item->>'quantity')::int;
  END LOOP;

  v_subtotal := (p_order->>'subtotal')::numeric;
  v_delivery_fee := (p_order->>'delivery_fee')::numeric;
  v_total := (p_order->>'total_amount')::numeric;

  IF v_subtotal < 0 OR v_subtotal > 10000
     OR v_delivery_fee < 0 OR v_delivery_fee > 50
     OR v_total < 0 OR v_total > 10500 THEN
    RAISE EXCEPTION 'Invalid amounts';
  END IF;
  IF abs(v_sum - v_subtotal) > 0.01 THEN
    RAISE EXCEPTION 'Subtotal mismatch';
  END IF;
  IF abs(v_subtotal + v_delivery_fee - v_total) > 0.01 THEN
    RAISE EXCEPTION 'Total mismatch';
  END IF;

  INSERT INTO orders (
    customer_name, customer_phone, fulfillment_type, area, address,
    items, subtotal, delivery_fee, total_amount, payment_method, receipt_url
  )
  VALUES (
    left(trim(p_order->>'customer_name'), 100),
    left(trim(p_order->>'customer_phone'), 20),
    p_order->>'fulfillment_type',
    nullif(left(p_order->>'area', 100), ''),
    nullif(left(p_order->>'address', 500), ''),
    v_items,
    v_subtotal,
    v_delivery_fee,
    v_total,
    p_order->>'payment_method',
    nullif(p_order->>'receipt_url', '')
  )
  RETURNING order_number INTO v_order_number;

  RETURN v_order_number;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_order FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order TO anon, authenticated;