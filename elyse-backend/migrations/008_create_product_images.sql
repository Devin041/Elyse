-- Migration: Create Product Images Table
-- Date: 2025-11-26
-- Description: Add product_images table for primary product images (search, listings, default product view)
-- This is separate from product_variant_images which stores color-specific images

BEGIN;

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id 
ON product_images(product_id);

CREATE INDEX IF NOT EXISTS idx_product_images_primary 
ON product_images(product_id, is_primary) 
WHERE is_primary = true;

-- Add constraint: only one primary image per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_one_primary 
ON product_images(product_id) 
WHERE is_primary = true;

COMMIT;

-- Verification query (run separately to test)
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'product_images'
-- ORDER BY ordinal_position;
