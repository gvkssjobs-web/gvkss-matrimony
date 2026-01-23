-- Quick fix script to resolve role constraint violation
-- Run this immediately to fix the issue

BEGIN;

-- Step 1: Update ALL users that are not 'admin' or 'user' to 'user'
-- This handles any variations like 'plat', 'gold', 'silver', 'platinum', etc.
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

COMMIT;

-- Verify the fix
SELECT id, email, name, role 
FROM users 
WHERE role NOT IN ('admin', 'user')
ORDER BY id;

-- If the above query returns no rows, the fix was successful!
