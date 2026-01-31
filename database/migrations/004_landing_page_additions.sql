-- ============================================
-- ELYSE E-COMMERCE - COMPATIBLE ADDITIONS
-- Migration: Add Missing Tables to Existing Schema
-- ============================================
-- This works with existing UUID-based schema
-- Date: 2025-11-27

-- ============================================
-- 1. ADD PROFILES TABLE (extends auth.users from Supabase)
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (id::text = auth.uid()::text);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (id::text = auth.uid()::text);

-- ============================================
-- 2. STOCK NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.stock_notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, variant_id)
);

ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own stock notifications" 
  ON public.stock_notifications FOR ALL 
  USING (user_id::text = auth.uid()::text);

-- ============================================
-- 3. OCCASION CATEGORIES (for Shop by Occasion section)
-- ============================================

CREATE TABLE IF NOT EXISTS public.occasion_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  cloudinary_id TEXT,
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.occasion_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled occasions" 
  ON public.occasion_categories FOR SELECT 
  USING (is_enabled = true);

CREATE POLICY "Admins can manage occasions" 
  ON public.occasion_categories FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- 4. HERO SECTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.hero_sections (
  id SERIAL PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  background_type TEXT DEFAULT 'gradient' CHECK (background_type IN ('gradient', 'image', 'video')),
  background_gradient_from TEXT,
  background_gradient_to TEXT,
  background_image_url TEXT,
  background_video_url TEXT,
  video_fallback_image TEXT,
  video_settings JSONB DEFAULT '{"autoplay": true, "loop": true, "muted": true, "showControls": false}'::jsonb,
  
  cta_text TEXT,
  cta_link TEXT,
  cta_bg_color TEXT,
  cta_text_color TEXT,
  
  layout TEXT DEFAULT 'center' CHECK (layout IN ('left', 'center', 'right')),
  text_alignment TEXT DEFAULT 'center' CHECK (text_alignment IN ('left', 'center', 'right')),
  
  right_images JSONB DEFAULT '[]'::jsonb,
  
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hero_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled hero sections" 
  ON public.hero_sections FOR SELECT 
  USING (is_enabled = true);

CREATE POLICY "Admins can manage hero sections" 
  ON public.hero_sections FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- 5. PRODUCT SECTIONS (Best Sellers, New Arrivals, etc.)
-- ============================================

CREATE TABLE IF NOT EXISTS public.product_sections (
  id SERIAL PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  selection_type TEXT DEFAULT 'auto' CHECK (selection_type IN ('auto', 'manual')),
  auto_filter JSONB DEFAULT '{}'::jsonb,
  manual_product_ids UUID[] DEFAULT ARRAY[]::UUID[],
  columns_desktop INTEGER DEFAULT 4,
  columns_tablet INTEGER DEFAULT 2,
  columns_mobile INTEGER DEFAULT 1,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default product sections
INSERT INTO public.product_sections (section_key, title, selection_type, auto_filter) VALUES
  ('best-sellers', 'Best Sellers', 'auto', '{"type": "best-sellers", "limit": 8}'::jsonb),
  ('new-arrivals', 'New Arrivals', 'auto', '{"type": "new-arrivals", "limit": 8}'::jsonb),
  ('handpicked', 'Handpicked Styles', 'manual', '{}'::jsonb)
ON CONFLICT (section_key) DO NOTHING;

ALTER TABLE public.product_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled product sections" 
  ON public.product_sections FOR SELECT 
  USING (is_enabled = true);

CREATE POLICY "Admins can manage product sections" 
  ON public.product_sections FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- 6. BRAND STORY
-- ============================================

CREATE TABLE IF NOT EXISTS public.brand_story (
  id SERIAL PRIMARY KEY,
  heading TEXT,
  subheading TEXT,
  description TEXT,
  background_image_url TEXT,
  text_color TEXT DEFAULT '#000000',
  background_color TEXT DEFAULT '#ffffff',
  text_alignment TEXT DEFAULT 'center' CHECK (text_alignment IN ('left', 'center', 'right')),
  is_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default brand story
INSERT INTO public.brand_story (heading, description, is_enabled) VALUES
  ('Crafted with Love', 'Every piece is handpicked to make you feel extraordinary.', true)
ON CONFLICT DO NOTHING;

ALTER TABLE public.brand_story ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view brand story" 
  ON public.brand_story FOR SELECT 
  USING (is_enabled = true);

CREATE POLICY "Admins can manage brand story" 
  ON public.brand_story FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- 7. GIFT CARDS BANNER
-- ============================================

CREATE TABLE IF NOT EXISTS public.gift_cards_banner (
  id SERIAL PRIMARY KEY,
  title TEXT,
  description TEXT,
  cta_text TEXT DEFAULT 'Shop Gift Cards',
  cta_link TEXT DEFAULT '/gift-cards',
  background_image_url TEXT,
  overlay_opacity INTEGER DEFAULT 50 CHECK (overlay_opacity >= 0 AND overlay_opacity <= 100),
  text_color TEXT DEFAULT '#ffffff',
  button_bg_color TEXT DEFAULT '#000000',
  button_text_color TEXT DEFAULT '#ffffff',
  is_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gift_cards_banner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gift cards banner" 
  ON public.gift_cards_banner FOR SELECT 
  USING (is_enabled = true);

CREATE POLICY "Admins can manage gift cards banner" 
  ON public.gift_cards_banner FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- 8. APPOINTMENT CTA
-- ============================================

CREATE TABLE IF NOT EXISTS public.appointment_cta (
  id SERIAL PRIMARY KEY,
  heading TEXT,
  subheading TEXT,
  contact_method TEXT DEFAULT 'whatsapp' CHECK (contact_method IN ('whatsapp', 'phone', 'email', 'link')),
  contact_value TEXT,
  heading_color TEXT DEFAULT '#000000',
  subheading_color TEXT DEFAULT '#666666',
  button_bg_color TEXT DEFAULT '#25D366',
  button_text_color TEXT DEFAULT '#ffffff',
  icon_color TEXT DEFAULT '#25D366',
  is_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointment_cta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view appointment CTA" 
  ON public.appointment_cta FOR SELECT 
  USING (is_enabled = true);

CREATE POLICY "Admins can manage appointment CTA" 
  ON public.appointment_cta FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- 9. PRODUCT CAROUSEL
-- ============================================

CREATE TABLE IF NOT EXISTS public.product_carousel (
  id SERIAL PRIMARY KEY,
  section_title TEXT DEFAULT 'Featured Collections',
  autoplay_interval INTEGER DEFAULT 3000,
  show_arrows BOOLEAN DEFAULT true,
  show_dots BOOLEAN DEFAULT true,
  is_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.carousel_tabs (
  id SERIAL PRIMARY KEY,
  carousel_id INTEGER REFERENCES public.product_carousel(id) ON DELETE CASCADE,
  tab_name TEXT NOT NULL,
  tab_color TEXT DEFAULT '#000000',
  product_ids UUID[] DEFAULT ARRAY[]::UUID[],
  display_order INTEGER DEFAULT 0
);

ALTER TABLE public.product_carousel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carousel_tabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view carousel" 
  ON public.product_carousel FOR SELECT 
  USING (is_enabled = true);

CREATE POLICY "Anyone can view carousel tabs" 
  ON public.carousel_tabs FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage carousel" 
  ON public.product_carousel FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage carousel tabs" 
  ON public.carousel_tabs FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- 10. BLOG SECTION CONFIG & FEATURED POSTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.blog_section_config (
  id SERIAL PRIMARY KEY,
  section_title TEXT DEFAULT 'Good Reads',
  show_on_homepage BOOLEAN DEFAULT true,
  max_posts_to_show INTEGER DEFAULT 3,
  is_enabled BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.featured_blog_posts (
  id SERIAL PRIMARY KEY,
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0
);

ALTER TABLE public.blog_section_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog config" 
  ON public.blog_section_config FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view featured posts" 
  ON public.featured_blog_posts FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage blog config" 
  ON public.blog_section_config FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage featured posts" 
  ON public.featured_blog_posts FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- ============================================
-- 11. UPDATE REVIEWS TABLE (add approval fields if not exists)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_reviews' AND column_name='is_approved') THEN
    ALTER TABLE public.product_reviews ADD COLUMN is_approved BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_reviews' AND column_name='approved_by') THEN
    ALTER TABLE public.product_reviews ADD COLUMN approved_by UUID REFERENCES public.users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_reviews' AND column_name='approved_at') THEN
    ALTER TABLE public.product_reviews ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
END$$;

-- ============================================
-- MIGRATION COMPLETE
-- All landing page tables added!
-- ============================================
