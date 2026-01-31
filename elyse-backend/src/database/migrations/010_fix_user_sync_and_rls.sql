-- Migration: 010_fix_user_sync_and_rls (Final Corrected)
-- Description: Sync Supabase Auth users to public.users and enable RLS
-- Created: 2026-01-16

-- 1. Relax password_hash constraint
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Enable RLS
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for user_addresses
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.user_addresses;
    CREATE POLICY "Users can manage their own addresses"
    ON public.user_addresses
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- 4. RLS Policies for wishlists
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlists;
    CREATE POLICY "Users can manage their own wishlist"
    ON public.wishlists
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- 5. RLS Policies for wishlist_items
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage their own wishlist items" ON public.wishlist_items;
    CREATE POLICY "Users can manage their own wishlist items"
    ON public.wishlist_items
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- 6. User sync trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'customer',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.users.last_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- 8. Sync existing users
INSERT INTO public.users (id, email, first_name, last_name, role, email_verified)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'first_name', ''),
    COALESCE(raw_user_meta_data->>'last_name', ''),
    'customer',
    true
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.users.last_name);
