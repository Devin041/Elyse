-- ============================================
-- ELYSE E-COMMERCE DATABASE SCHEMA
-- Migration 003 - Reviews & Landing Pages
-- ============================================
-- Run this AFTER migration_002_cart_orders.sql
-- Date: 2025-11-27

-- ============================================
-- 1. PRODUCT REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id SERIAL PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_id INTEGER REFERENCES public.orders(id),
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  
  -- Helpful votes
  helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(product_id, user_id, order_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view approved reviews" 
  ON public.reviews FOR SELECT 
  USING (is_approved = true OR user_id = auth.uid());

CREATE POLICY "Users can create reviews for their orders" 
  ON public.reviews FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all reviews" 
  ON public.reviews FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 2. HERO SECTIONS
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
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 3. OCCASION CATEGORIES
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
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 4. PRODUCT SECTIONS
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
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 5. BRAND STORY
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
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 6. GIFT CARDS BANNER
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
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 7. APPOINTMENT CTA
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
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 8. PRODUCT CAROUSEL
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
  carousel_id INTEGER REFERENCES public.product_carousel(id) ON DELETE CASCADE NOT NULL,
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
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage carousel tabs" 
  ON public.carousel_tabs FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 9. BLOG POSTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image_url TEXT,
  author TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Status
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_section_config (
  id SERIAL PRIMARY KEY,
  section_title TEXT DEFAULT 'Good Reads',
  show_on_homepage BOOLEAN DEFAULT true,
  max_posts_to_show INTEGER DEFAULT 3,
  is_enabled BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.featured_blog_posts (
  id SERIAL PRIMARY KEY,
  blog_post_id INTEGER REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_section_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts" 
  ON public.blog_posts FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Anyone can view blog config" 
  ON public.blog_section_config FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view featured posts" 
  ON public.featured_blog_posts FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage blog posts" 
  ON public.blog_posts FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage blog config" 
  ON public.blog_section_config FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage featured posts" 
  ON public.featured_blog_posts FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 10. MEDIA LIBRARY
-- ============================================

CREATE TABLE IF NOT EXISTS public.media_files (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  file_url TEXT NOT NULL,
  cloudinary_id TEXT NOT NULL,
  file_size INTEGER,
  duration INTEGER,
  dimensions JSONB,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all media" 
  ON public.media_files FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage media" 
  ON public.media_files FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 11. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_reviews_approved ON public.reviews(is_approved);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published);

-- ============================================
-- MIGRATION COMPLETE - ALL TABLES CREATED!
-- ============================================
