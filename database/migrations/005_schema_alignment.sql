-- Schema Alignment Migration
-- This updates existing tables to match new comprehensive schema

-- 1. Add subcategory support to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES categories(id);

-- 2. Update product_variants table structure
-- First check what columns exist and add/rename as needed

-- Add missing columns if they don't exist
ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- 3. Create product_colors table if doesn't exist
CREATE TABLE IF NOT EXISTS product_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name VARCHAR(100) NOT NULL,
  color_code VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, color_name)
);

-- 4. Create product_sizes table if doesn't exist
CREATE TABLE IF NOT EXISTS product_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  size_name VARCHAR(50) UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert standard sizes
INSERT INTO product_sizes (size_name, display_order) VALUES
  ('Free Size', 0),
  ('XS', 1),
  ('S', 2),
  ('M', 3),
  ('L', 4),
  ('XL', 5),
  ('XXL', 6),
  ('2-3 Years', 10),
  ('4-5 Years', 11),
  ('6-7 Years', 12),
  ('8-9 Years', 13),
  ('10-11 Years', 14)
ON CONFLICT (size_name) DO NOTHING;

-- 5. Add foreign keys to product_variants for new structure
ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS color_id UUID REFERENCES product_colors(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS size_id UUID REFERENCES product_sizes(id) ON DELETE SET NULL;

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_color ON product_variants(color_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_size ON product_variants(size_id);
CREATE INDEX IF NOT EXISTS idx_product_colors_product ON product_colors(product_id);

-- 7. Update products to link to subcategories where possible
-- For subcategories, set both category_id (to parent) and subcategory_id (to self)
UPDATE products p
SET category_id = (
  SELECT parent_id FROM categories WHERE id = p.category_id AND parent_id IS NOT NULL
),
subcategory_id = p.category_id
WHERE EXISTS (
  SELECT 1 FROM categories WHERE id = p.category_id AND parent_id IS NOT NULL
);

COMMENT ON COLUMN products.subcategory_id IS 'Reference to subcategory. Products can belong to main category and optionally a subcategory.';
COMMENT ON TABLE product_colors IS 'Available colors for each product';
COMMENT ON TABLE product_sizes IS 'Master list of available sizes';
