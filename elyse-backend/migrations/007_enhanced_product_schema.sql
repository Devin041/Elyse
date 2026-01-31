-- Migration: Enhanced Product Schema for Production-Grade System
-- Date: 2025-11-24
-- Description: Add color variants, variant images, SEO fields, and product details

BEGIN;

-- 1. Add color fields to product_variants table
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS color VARCHAR(100),
ADD COLUMN IF NOT EXISTS color_hex VARCHAR(7),
ADD COLUMN IF NOT EXISTS barcode VARCHAR(50),
ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS weight_grams INTEGER,
ADD COLUMN IF NOT EXISTS requires_shipping BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS taxable BOOLEAN DEFAULT true;

-- 2. Create product_variant_images junction table
CREATE TABLE IF NOT EXISTS product_variant_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_variant_images_product 
ON product_variant_images(product_id);

CREATE INDEX IF NOT EXISTS idx_variant_images_variant 
ON product_variant_images(variant_id);

-- 3. Add SEO and product detail fields to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) DEFAULT 'variable',
ADD COLUMN IF NOT EXISTS video_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS meta_keywords VARCHAR(255),
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;

-- 4. Update existing products to have published_at = created_at
UPDATE products 
SET published_at = created_at 
WHERE published_at IS NULL;

-- 5. Add check constraints for color_hex format
ALTER TABLE product_variants
ADD CONSTRAINT check_color_hex_format 
CHECK (color_hex IS NULL OR color_hex ~ '^#[0-9A-Fa-f]{6}$');

COMMIT;

-- Rollback script (if needed)
-- BEGIN;
-- ALTER TABLE product_variants DROP COLUMN IF EXISTS color;
-- ALTER TABLE product_variants DROP COLUMN IF EXISTS color_hex;
-- ALTER TABLE product_variants DROP COLUMN IF EXISTS barcode;
-- ALTER TABLE product_variants DROP COLUMN IF EXISTS compare_at_price;
-- ALTER TABLE product_variants DROP COLUMN IF EXISTS weight_grams;
-- ALTER TABLE product_variants DROP COLUMN IF EXISTS requires_shipping;
-- ALTER TABLE product_variants DROP COLUMN IF EXISTS taxable;
-- DROP TABLE IF EXISTS product_variant_images;
-- ALTER TABLE products DROP COLUMN IF EXISTS product_type;
-- ALTER TABLE products DROP COLUMN IF EXISTS video_url;
-- ALTER TABLE products DROP COLUMN IF EXISTS meta_keywords;
-- ALTER TABLE products DROP COLUMN IF EXISTS published_at;
-- COMMIT;
