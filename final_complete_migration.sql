-- FINAL COMPLETE DATABASE MIGRATION SCRIPT
-- This script includes:
-- 1. Role migration (gold/silver/platinum -> user)
-- 2. Adding all new profile columns
-- 3. Removing unwanted old columns
-- Run this script in your PostgreSQL database

BEGIN;

-- ============================================
-- PART 1: ROLE MIGRATION
-- ============================================

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

-- ============================================
-- PART 2: ADD NEW PROFILE COLUMNS
-- ============================================

-- Marriage Status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'marriage_status') THEN
        ALTER TABLE users ADD COLUMN marriage_status VARCHAR(50);
    END IF;
END $$;

-- Birth Time
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'birth_time') THEN
        ALTER TABLE users ADD COLUMN birth_time TIME;
    END IF;
END $$;

-- Birth Place
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'birth_place') THEN
        ALTER TABLE users ADD COLUMN birth_place VARCHAR(255);
    END IF;
END $$;

-- Height
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'height') THEN
        ALTER TABLE users ADD COLUMN height VARCHAR(20);
    END IF;
END $$;

-- Complexion
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'complexion') THEN
        ALTER TABLE users ADD COLUMN complexion VARCHAR(50);
    END IF;
END $$;

-- Siblings Info (JSONB)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'siblings_info') THEN
        ALTER TABLE users ADD COLUMN siblings_info JSONB;
    END IF;
END $$;

-- Star
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'star') THEN
        ALTER TABLE users ADD COLUMN star VARCHAR(50);
    END IF;
END $$;

-- Raasi
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'raasi') THEN
        ALTER TABLE users ADD COLUMN raasi VARCHAR(50);
    END IF;
END $$;

-- Gothram
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'gothram') THEN
        ALTER TABLE users ADD COLUMN gothram VARCHAR(100);
    END IF;
END $$;

-- Padam
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'padam') THEN
        ALTER TABLE users ADD COLUMN padam VARCHAR(50);
    END IF;
END $$;

-- Uncle Gothram
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'uncle_gothram') THEN
        ALTER TABLE users ADD COLUMN uncle_gothram VARCHAR(100);
    END IF;
END $$;

-- Education Category
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'education_category') THEN
        ALTER TABLE users ADD COLUMN education_category VARCHAR(100);
    END IF;
END $$;

-- Education Details
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'education_details') THEN
        ALTER TABLE users ADD COLUMN education_details TEXT;
    END IF;
END $$;

-- Employed In
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'employed_in') THEN
        ALTER TABLE users ADD COLUMN employed_in VARCHAR(255);
    END IF;
END $$;

-- Occupation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'occupation') THEN
        ALTER TABLE users ADD COLUMN occupation VARCHAR(255);
    END IF;
END $$;

-- Occupation in Details
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'occupation_in_details') THEN
        ALTER TABLE users ADD COLUMN occupation_in_details TEXT;
    END IF;
END $$;

-- Annual Income
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'annual_income') THEN
        ALTER TABLE users ADD COLUMN annual_income VARCHAR(100);
    END IF;
END $$;

-- Address
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address') THEN
        ALTER TABLE users ADD COLUMN address TEXT;
    END IF;
END $$;

-- ============================================
-- PART 3: REMOVE UNWANTED OLD COLUMNS
-- ============================================

-- Remove profession column (replaced by employed_in)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profession') THEN
        ALTER TABLE users DROP COLUMN profession;
        RAISE NOTICE 'Removed profession column';
    END IF;
END $$;

-- Remove education column (replaced by education_category and education_details)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'education') THEN
        ALTER TABLE users DROP COLUMN education;
        RAISE NOTICE 'Removed education column';
    END IF;
END $$;

-- Remove city column (not in new requirements)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'city') THEN
        ALTER TABLE users DROP COLUMN city;
        RAISE NOTICE 'Removed city column';
    END IF;
END $$;

-- Remove partner_preference column (not in new requirements)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'partner_preference') THEN
        ALTER TABLE users DROP COLUMN partner_preference;
        RAISE NOTICE 'Removed partner_preference column';
    END IF;
END $$;

-- Remove age column (can be calculated from dob)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'age') THEN
        ALTER TABLE users DROP COLUMN age;
        RAISE NOTICE 'Removed age column';
    END IF;
END $$;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify role migration
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role
ORDER BY role;

-- Verify new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN (
    'marriage_status', 'birth_time', 'birth_place', 'height', 'complexion',
    'siblings_info', 'star', 'raasi', 'gothram', 'padam', 'uncle_gothram',
    'education_category', 'education_details', 'employed_in', 
    'occupation', 'occupation_in_details', 'annual_income', 'address'
)
ORDER BY column_name;

-- Show all columns in users table (final structure)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;
