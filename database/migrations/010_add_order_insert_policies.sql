-- Migration: Add missing INSERT policies for orders and order_items
-- This allows order creation from the storefront API

-- Add INSERT policy for orders table
-- Allow anyone to create orders (for guest checkout)
-- Service role will bypass this anyway, but we add it for completeness
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Add INSERT policy for order_items table
-- Allow insertion if the parent order can be created
CREATE POLICY "Anyone can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- Note: With service role key, these policies are bypassed anyway
-- But they're needed for proper RLS configuration

COMMENT ON POLICY "Anyone can create orders" ON public.orders 
IS 'Allows order creation for guest checkout. Service role key bypasses this for admin operations.';

COMMENT ON POLICY "Anyone can create order items" ON public.order_items 
IS 'Allows order item creation. Service role key bypasses this for admin operations.';
