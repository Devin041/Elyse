-- Create Admin User in Supabase
-- Run this in Supabase SQL Editor

-- 1. First, check if admin user exists
SELECT id, email, role FROM auth.users WHERE email = 'admin@elyse.com';

-- 2. If user doesn't exist, you need to sign up via the login page first
-- Then run this to make them admin:

-- Update user role to admin (change the email if needed)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@elyse.com';

-- 3. Verify admin role
SELECT id, email, role FROM profiles WHERE email = 'admin@elyse.com';

-- Expected output:
-- role should be 'admin' (not 'customer')
