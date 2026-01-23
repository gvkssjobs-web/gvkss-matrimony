-- SQL script to add all new columns for extended profile information
-- Run this script in your PostgreSQL database

-- Add new columns if they don't exist
DO $$
BEGIN
    -- Marriage Status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'marriage_status') THEN
        ALTER TABLE users ADD COLUMN marriage_status VARCHAR(50);
    END IF;

    -- Birth Time
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'birth_time') THEN
        ALTER TABLE users ADD COLUMN birth_time TIME;
    END IF;

    -- Birth Place
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'birth_place') THEN
        ALTER TABLE users ADD COLUMN birth_place VARCHAR(255);
    END IF;

    -- Height
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'height') THEN
        ALTER TABLE users ADD COLUMN height VARCHAR(20);
    END IF;

    -- Complexion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'complexion') THEN
        ALTER TABLE users ADD COLUMN complexion VARCHAR(50);
    END IF;

    -- Siblings Info (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'siblings_info') THEN
        ALTER TABLE users ADD COLUMN siblings_info JSONB;
    END IF;

    -- Star
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'star') THEN
        ALTER TABLE users ADD COLUMN star VARCHAR(50);
    END IF;

    -- Raasi
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'raasi') THEN
        ALTER TABLE users ADD COLUMN raasi VARCHAR(50);
    END IF;

    -- Gothram
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'gothram') THEN
        ALTER TABLE users ADD COLUMN gothram VARCHAR(100);
    END IF;

    -- Padam
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'padam') THEN
        ALTER TABLE users ADD COLUMN padam VARCHAR(50);
    END IF;

    -- Uncle Gothram
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'uncle_gothram') THEN
        ALTER TABLE users ADD COLUMN uncle_gothram VARCHAR(100);
    END IF;

    -- Education Category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'education_category') THEN
        ALTER TABLE users ADD COLUMN education_category VARCHAR(100);
    END IF;

    -- Education Details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'education_details') THEN
        ALTER TABLE users ADD COLUMN education_details TEXT;
    END IF;

    -- Employed In
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'employed_in') THEN
        ALTER TABLE users ADD COLUMN employed_in VARCHAR(255);
    END IF;

    -- Address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address') THEN
        ALTER TABLE users ADD COLUMN address TEXT;
    END IF;

    RAISE NOTICE 'All new columns added successfully';
END $$;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN (
    'marriage_status', 'birth_time', 'birth_place', 'height', 'complexion',
    'siblings_info', 'star', 'raasi', 'gothram', 'padam', 'uncle_gothram',
    'education_category', 'education_details', 'employed_in', 'address'
)
ORDER BY column_name;
