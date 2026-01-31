-- Migration: 012_performance_and_security_tuning
-- Description: Add missing indexes for product/collection lookups and enable RLS for production data
-- Created: 2026-01-28

-- 1. PERFORMANCE: ADD MISSING INDEXES
-- Redundant if exists, but ensuring high-speed lookup for the most common queries

-- Enable trigram extension for fuzzy slug lookups
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Slug lookups (The #1 reason for slow product page loads)
CREATE INDEX IF NOT EXISTS idx_products_slug_trigram ON public.products USING gin (slug gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_categories_slug_trigram ON public.categories USING gin (slug gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_collections_slug_trigram ON public.collections USING gin (slug gin_trgm_ops);

-- Foreign Key & Filter optimization
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_variant_id ON public.product_images(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_product_id ON public.product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag_id ON public.product_tags(tag_id);

-- Date based ordering (Ensures "New Arrivals" is instant)
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 2. SECURITY: ENABLE RLS
-- Protecting tables from direct anonymous manipulation while allowing public read

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 3. PUBLIC READ POLICIES
-- Allow anyone to view catalog data (Essential for SEO and Storefront)

DO $$ 
BEGIN
    -- Products
    DROP POLICY IF EXISTS "Public can view active products" ON public.products;
    CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = true);

    -- Categories
    DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
    CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);

    -- Collections
    DROP POLICY IF EXISTS "Public can view collections" ON public.collections;
    CREATE POLICY "Public can view collections" ON public.collections FOR SELECT USING (true);

    -- Variants
    DROP POLICY IF EXISTS "Public can view variants" ON public.product_variants;
    CREATE POLICY "Public can view variants" ON public.product_variants FOR SELECT USING (true);

    -- Images
    DROP POLICY IF EXISTS "Public can view images" ON public.product_images;
    CREATE POLICY "Public can view images" ON public.product_images FOR SELECT USING (true);

    -- Tags
    DROP POLICY IF EXISTS "Public can view tags" ON public.tags;
    CREATE POLICY "Public can view tags" ON public.tags FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public can view product_tags" ON public.product_tags;
    CREATE POLICY "Public can view product_tags" ON public.product_tags FOR SELECT USING (true);
END $$;

-- 4. CART SECURITY
-- Users manage their own carts

DO $$
BEGIN
    -- Carts
    DROP POLICY IF EXISTS "Users manage their own carts" ON public.carts;
    CREATE POLICY "Users manage their own carts" ON public.carts FOR ALL TO authenticated USING (auth.uid() = user_id);

    -- Cart Items (Actual schema uses user_id directly)
    DROP POLICY IF EXISTS "Users manage their own cart items" ON public.cart_items;
    CREATE POLICY "Users manage their own cart items" ON public.cart_items FOR ALL TO authenticated USING (auth.uid() = user_id);
END $$;
