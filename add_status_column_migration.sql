-- Migration script to add status column to users table
-- This script is idempotent - it can be run multiple times safely

DO $$ 
BEGIN
    -- Check if status column exists, if not, add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'status'
    ) THEN
        -- Add status column with CHECK constraint
        ALTER TABLE users 
        ADD COLUMN status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected'));
        
        RAISE NOTICE 'Status column added successfully';
    ELSE
        RAISE NOTICE 'Status column already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'status';
