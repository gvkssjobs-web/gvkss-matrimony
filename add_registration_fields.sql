-- SQL commands to add missing columns for registration form
-- Run these commands in your PostgreSQL database

-- Add education column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS education VARCHAR(255);

-- Add city column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(255);

-- Add date of birth (dob) column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE;

-- Add partner preference column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_preference TEXT;

-- Verify the columns were added
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- AND column_name IN ('education', 'city', 'dob', 'partner_preference');
