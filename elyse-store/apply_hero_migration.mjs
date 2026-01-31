import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manual env parsing from elyse-admin which should have service key
const envPath = path.resolve(__dirname, '../elyse-admin/.env.local');

let envVars = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) envVars[key.trim()] = val.trim().replace(/^"|"$/g, '');
    });
} catch (e) {
    console.error('Could not read admin env:', e.message);
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing credentials. Found:', {
        url: !!supabaseUrl,
        key: !!serviceRoleKey
    });
    console.log('Checked path:', envPath);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// ... (rest of SQL remains same)
const migrationSQL = `
-- Create hero_sections table
CREATE TABLE IF NOT EXISTS hero_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    cta_text TEXT,
    cta_link TEXT,
    background_type TEXT DEFAULT 'image',
    background_image_url TEXT,
    video_url TEXT,
    text_color TEXT DEFAULT 'white',
    display_order INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'hero_sections' AND policyname = 'Public read access'
    ) THEN
        CREATE POLICY "Public read access" ON hero_sections FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'hero_sections' AND policyname = 'Admin full access'
    ) THEN
        CREATE POLICY "Admin full access" ON hero_sections USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Insert default heroes
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
`;

async function apply() {
    console.log('Applying migration...');
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
        console.error('RPC Error:', error);
        // Fallback: try raw query via rest is hard without key, but client can support it if query enabled
        // Or if error is just "function not found", we can't do much.
    } else {
        console.log('✅ Migration applied.');
    }
}

apply();
