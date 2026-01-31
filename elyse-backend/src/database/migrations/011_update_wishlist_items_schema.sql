-- Migration: 011_update_wishlist_items_schema
-- Description: Add variant_id to wishlist_items and ensure consistent schema
-- Created: 2026-01-16

-- 1. Add variant_id column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishlist_items' AND column_name = 'variant_id') THEN
        ALTER TABLE public.wishlist_items ADD COLUMN variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Rename created_at to added_at for consistency with store logic (optional, but good for clarity)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wishlist_items' AND column_name = 'created_at') THEN
        ALTER TABLE public.wishlist_items RENAME COLUMN created_at TO added_at;
    END IF;
END $$;

-- 3. Adjust Primary Key
-- First drop existing PK if it's not what we want (usually it's on (user_id, product_id) or has an 'id' serial)
-- Our check-db-v3 showed an 'id' integer column. Let's keep it but add unique constraint.
ALTER TABLE public.wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_user_id_product_id_variant_id_key;
ALTER TABLE public.wishlist_items ADD CONSTRAINT wishlist_items_user_id_product_id_variant_id_key UNIQUE (user_id, product_id, variant_id);
