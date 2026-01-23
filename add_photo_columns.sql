-- Add photo_blob and photo_s3_url columns to users table
-- Run this SQL in your PostgreSQL database if the columns don't exist

-- Check if photo_blob column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'photo_blob'
    ) THEN
        ALTER TABLE users ADD COLUMN photo_blob BYTEA;
        RAISE NOTICE 'Photo blob column added successfully';
    ELSE
        RAISE NOTICE 'Photo blob column already exists';
    END IF;
END $$;

-- Check if photo_s3_url column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'photo_s3_url'
    ) THEN
        ALTER TABLE users ADD COLUMN photo_s3_url VARCHAR(500);
        RAISE NOTICE 'Photo S3 URL column added successfully';
    ELSE
        RAISE NOTICE 'Photo S3 URL column already exists';
    END IF;
END $$;
