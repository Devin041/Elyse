-- Migration: 002_create_categories_table
-- Description: Create categories table with hierarchical support
-- Created: 2025-11-23

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = true;

-- Auto-update timestamp trigger
CREATE TRIGGER update_categories_updated_at 
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Women', 'women', 'Women''s fashion and accessories', 1),
  ('Men', 'men', 'Men''s fashion and accessories', 2),
  ('Kids', 'kids', 'Kids fashion and accessories', 3),
  ('Accessories', 'accessories', 'Fashion accessories', 4),
  ('Sale', 'sale', 'Sale items', 5)
ON CONFLICT (slug) DO NOTHING;
