-- SQL script to remove unwanted columns from users table
-- This removes old columns that are no longer needed:
-- - profession (replaced by employed_in)
-- - education (replaced by education_category and education_details)
-- - city (not in new requirements)
-- - partner_preference (not in new requirements)
-- - age (can be calculated from dob)

BEGIN;

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

-- Verify columns were removed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY column_name;
