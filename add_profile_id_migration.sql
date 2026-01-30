-- Add profile_id: displayed/URL id. Random on register; 5000+ when accepted.
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_id INTEGER UNIQUE;

-- Backfill: existing users keep id as profile_id (or leave null and set on next accept)
UPDATE users SET profile_id = id WHERE profile_id IS NULL AND id IS NOT NULL;

-- Ensure unique constraint for new random/5000+ ids
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_profile_id ON users(profile_id);
