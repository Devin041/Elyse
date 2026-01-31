-- Create hero_sections table
CREATE TABLE IF NOT EXISTS hero_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    cta_text TEXT,
    cta_link TEXT,
    background_type TEXT DEFAULT 'image', -- 'image', 'video', 'gradient'
    background_image_url TEXT,
    video_url TEXT, -- New field for direct video URL access if needed, though we store in config too
    text_color TEXT DEFAULT 'white',
    display_order INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb, -- flexible storage for complex props like gradients, multiple images
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access" ON hero_sections
    FOR SELECT USING (true);

CREATE POLICY "Admin full access" ON hero_sections
    USING (true)
    WITH CHECK (true);

-- Insert default heroes (mapped from initial hardcoded data)
INSERT INTO hero_sections (id, title, subtitle, background_type, config, display_order)
VALUES 
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'पोली',
        'Bella Edit: For the bridesmaid who brings the glam to the wedding!',
        'gradient',
        '{"titleStyle": "outline", "backgroundGradient": {"start": "#FFD700", "end": "#FFA500"}, "leftImage": "/heroes/yellow-left.png", "rightImages": ["/heroes/yellow-right.png"], "height": "full"}'::jsonb,
        1
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        'मेंदी',
        'Bella Edit: For the bridesmaid who brings the glam to the wedding!',
        'gradient',
        '{"titleStyle": "outline", "backgroundGradient": {"start": "#B91C31", "end": "#F5A623"}, "leftImage": "/heroes/gradient-left.png", "rightImages": ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80", "https://images.unsplash.com/photo-1610189012908-3269f2b7b2d0?q=80"], "height": "large"}'::jsonb,
        2
    )
ON CONFLICT (id) DO NOTHING;
