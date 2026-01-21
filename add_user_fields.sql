-- SQL commands to add phone_number, profession, and age columns to users table
-- Run these commands in your PostgreSQL database

-- Add phone_number column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Add profession column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS profession VARCHAR(255);

-- Add age column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;

-- Verify the columns were added
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- AND column_name IN ('phone_number', 'profession', 'age');
