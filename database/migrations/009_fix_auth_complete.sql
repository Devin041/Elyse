-- ============================================
-- COMPLETE AUTHENTICATION FIX FOR ELYSE ADMIN
-- CTO Solution - Run this entire script
-- ============================================

-- Step 1: Clean up any orphaned profiles (where user doesn't exist in auth.users)
DELETE FROM profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- Step 2: Check current state
SELECT 'auth.users:' as table_name, id, email FROM auth.users WHERE email = 'adity041.joshi@gmail.com'
UNION ALL
SELECT 'profiles:' as table_name, id, email FROM profiles WHERE email = 'adity041.joshi@gmail.com';

-- Step 3: Create profile for adity041.joshi@gmail.com with CORRECT ID from auth.users
INSERT INTO profiles (id, email, role, full_name, is_verified, created_at, updated_at)
SELECT 
    id,
    email,
    'admin',
    'Aditya Joshi',
    true,
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'adity041.joshi@gmail.com'
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin',
    is_verified = true,
    updated_at = NOW();

-- Step 4: Verify the fix
SELECT 
    au.id as auth_id,
    au.email,
    p.id as profile_id,
    p.role,
    p.is_verified,
    CASE 
        WHEN au.id = p.id THEN '✅ IDs MATCH'
        ELSE '❌ IDs MISMATCH'
    END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'adity041.joshi@gmail.com';

-- Expected Output:
-- auth_id                              | email                    | profile_id                           | role  | is_verified | status
-- -------------------------------------|--------------------------|--------------------------------------|-------|-------------|--------
-- 182036e9-4c3e-4e1d-9300-d0e8efc83668 | adity041.joshi@gmail.com | 182036e9-4c3e-4e1d-9300-d0e8efc83668 | admin | true        | ✅ IDs MATCH
