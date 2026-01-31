-- Fix: Create profile entry for existing user
-- Run this in Supabase SQL Editor

-- Step 1: Check if profile exists
SELECT * FROM profiles WHERE email = 'adity041.joshi@gmail.com';

-- Step 2: If no results, INSERT the profile
INSERT INTO profiles (id, email, role)
SELECT 
    id,
    email,
    'admin'
FROM auth.users 
WHERE email = 'adity041.joshi@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Step 3: Verify it was created
SELECT id, email, role, created_at 
FROM profiles 
WHERE email = 'adity041.joshi@gmail.com';

-- Expected output:
-- id                                   | email                      | role  | created_at
-- -------------------------------------|----------------------------|-------|---------------------------
-- 182036e9-4c3e-4e1d-9300-d0e8efc83668 | adity041.joshi@gmail.com  | admin | 2025-12-06 16:34:00+00
