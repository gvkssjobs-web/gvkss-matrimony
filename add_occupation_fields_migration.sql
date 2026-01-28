-- Migration script to add Occupation, Occupation in Details, and Annual Income fields
-- Run this script in your PostgreSQL database

BEGIN;

-- ============================================
-- ADD NEW OCCUPATION FIELDS
-- ============================================

-- Occupation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'occupation') THEN
        ALTER TABLE users ADD COLUMN occupation VARCHAR(255);
        RAISE NOTICE 'Occupation column added successfully';
    ELSE
        RAISE NOTICE 'Occupation column already exists';
    END IF;
END $$;

-- Occupation in Details
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'occupation_in_details') THEN
        ALTER TABLE users ADD COLUMN occupation_in_details TEXT;
        RAISE NOTICE 'Occupation in Details column added successfully';
    ELSE
        RAISE NOTICE 'Occupation in Details column already exists';
    END IF;
END $$;

-- Annual Income
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'annual_income') THEN
        ALTER TABLE users ADD COLUMN annual_income VARCHAR(100);
        RAISE NOTICE 'Annual Income column added successfully';
    ELSE
        RAISE NOTICE 'Annual Income column already exists';
    END IF;
END $$;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify new columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('occupation', 'occupation_in_details', 'annual_income')
ORDER BY column_name;
