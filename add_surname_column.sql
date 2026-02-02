-- Add surname column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS surname VARCHAR(255);
