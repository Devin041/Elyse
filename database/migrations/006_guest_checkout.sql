-- Migration: Make user_id nullable in orders table for guest checkout
-- This allows customers to place orders without creating an account

ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Add customer_email column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'customer_email'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN customer_email TEXT;
    END IF;
END $$;

-- Create index on customer_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);

-- Update comment
COMMENT ON COLUMN public.orders.user_id IS 'User ID from profiles table. NULL for guest checkout orders.';
COMMENT ON COLUMN public.orders.customer_email IS 'Customer email for order confirmation. Required for all orders.';
