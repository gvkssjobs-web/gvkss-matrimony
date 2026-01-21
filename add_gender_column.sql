-- SQL command to add gender column to users table
-- Run this command in your PostgreSQL database

-- Add gender column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

-- Verify the column was added
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'gender';
