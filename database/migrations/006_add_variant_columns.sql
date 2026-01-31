-- Add missing columns to product_variants
ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Also ensure we have the right structure
ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
ADD COLUMN IF NOT EXISTS price_adjustment DECIMAL(10,2) DEFAULT 0.00;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_available ON product_variants(is_available);
