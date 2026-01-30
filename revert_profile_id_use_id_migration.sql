-- Revert profile_id: use the main id column only.
-- 1) Drop profile_id column and index
ALTER TABLE users DROP COLUMN IF EXISTS profile_id;
DROP INDEX IF EXISTS idx_users_profile_id;

-- 2) Notifications: add ON UPDATE CASCADE so when users.id changes (e.g. on accept), references stay valid
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
