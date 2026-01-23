-- CRITICAL: Fix existing data FIRST before applying constraint
-- Run this script to fix the immediate issue

-- Step 1: First, temporarily drop the constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Update ALL existing users with invalid roles to 'user'
-- This includes 'plat', 'gold', 'silver', 'platinum', and any other variations
UPDATE users 
SET role = 'user' 
WHERE role NOT IN ('admin', 'user') OR role IS NULL;

-- Step 3: Verify all roles are now valid
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- Step 4: Now add the constraint back
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'user'));

-- Step 5: Set default role to 'user'
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';

-- Final verification - should return no rows
SELECT id, email, name, role 
FROM users 
WHERE role NOT IN ('admin', 'user');

-- If the above returns no rows, you're good to go!
