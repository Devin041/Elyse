-- Create a table to store dynamic landing page settings
CREATE TABLE IF NOT EXISTS landing_page_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE landing_page_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (public storefront needs it)
CREATE POLICY "Allow public read access" ON landing_page_settings
    FOR SELECT USING (true);

-- Allow full access to admins/service role
CREATE POLICY "Allow full access to service role" ON landing_page_settings
    USING (true)
    WITH CHECK (true);

-- Insert default values (optional, can be done via Admin API later)
INSERT INTO landing_page_settings (key, value)
VALUES 
    ('shop_by_style', '[]'::jsonb),
    ('hero_grid', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;
