-- Migration: 004_create_collections_tables
-- Description: Create collections and collection_products tables
-- Created: 2025-11-23

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Collection products junction table
CREATE TABLE IF NOT EXISTS collection_products (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_collection_products_collection ON collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product ON collection_products(product_id);

-- Auto-update timestamp trigger
CREATE TRIGGER update_collections_updated_at 
BEFORE UPDATE ON collections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default collections
INSERT INTO collections (name, slug, description, display_order) VALUES
  ('New Arrivals', 'new-arrivals', 'Latest products', 1),
  ('Best Sellers', 'best-sellers', 'Top selling products', 2),
  ('Summer Collection', 'summer-collection', 'Summer fashion collection', 3)
ON CONFLICT (slug) DO NOTHING;
