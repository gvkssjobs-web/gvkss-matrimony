-- Migration script to update roles from (admin, gold, silver, platinum) to (admin, user)
-- Run this script in your PostgreSQL database

-- Step 1: Update all existing users with old roles to 'user'
-- Handle all variations: gold, silver, platinum, plat, etc.
UPDATE users 
SET role = 'user' 
WHERE role NOT IN ('admin', 'user') OR role IS NULL;

-- Step 2: Drop the old constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 3: Add the new constraint allowing only 'admin' and 'user'
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'user'));

-- Step 4: Set default role to 'user'
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';

-- Step 5: Verify the changes
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- Expected output should show only 'admin' and 'user' roles
