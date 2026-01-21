-- SQL command to add photo column to users table
-- Run this command in your PostgreSQL database

-- First, check if the column already exists (optional check)
-- SELECT column_name 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'photo';

-- Add photo column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo VARCHAR(500);

-- Verify the column was added
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'photo';
