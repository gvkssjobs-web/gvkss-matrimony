-- SQL command to delete all users except admin users
-- Run this command in your PostgreSQL database

-- Delete all users where role is NOT 'admin'
DELETE FROM users WHERE role != 'admin';

-- Verify the deletion (optional check)
-- SELECT id, email, name, role FROM users;

-- Alternative: If you want to be more explicit and handle NULL roles
-- DELETE FROM users WHERE role IS NULL OR role != 'admin';
