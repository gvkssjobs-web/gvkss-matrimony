-- ============================================
-- GVKSS MATRIMONY - COMPLETE DATABASE SCHEMA
-- PostgreSQL - Run this to create a new DB from scratch
-- ============================================
-- Usage:
--   1. Create database: CREATE DATABASE gvkss_matrimony;
--   2. Connect to it and run this file: \i database_schema.sql
-- ============================================
   
-- Optional: create database (run as superuser, then connect to gvkss_matrimony)
-- CREATE DATABASE gvkss_matrimony;

-- ============================================                                                                     
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  surname VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')),

  -- Photos (main + 4 slots: url, blob, s3_url each)
  photo VARCHAR(500),
  photo_blob BYTEA,
  photo_s3_url VARCHAR(500),
  photo_2 VARCHAR(500),
  photo_2_blob BYTEA,
  photo_2_s3_url VARCHAR(500),
  photo_3 VARCHAR(500),
  photo_3_blob BYTEA,
  photo_3_s3_url VARCHAR(500),
  photo_4 VARCHAR(500),
  photo_4_blob BYTEA,
  photo_4_s3_url VARCHAR(500),

  -- Contact
  phone_number VARCHAR(20),
  phone_number_2 VARCHAR(20),

  -- Basic profile
  gender VARCHAR(20),
  dob DATE,
  marriage_status VARCHAR(50),
  birth_time TIME,
  birth_place VARCHAR(255),
  height VARCHAR(20),
  complexion VARCHAR(50),
  siblings_info JSONB,

  -- Astro (star, raasi, gothram, etc.)
  star VARCHAR(50),
  raasi VARCHAR(50),
  gothram VARCHAR(100),
  padam VARCHAR(50),
  uncle_gothram VARCHAR(100),

  -- Education & career
  education_category VARCHAR(100),
  education_details TEXT,
  employed_in VARCHAR(255),
  occupation VARCHAR(255),
  occupation_in_details TEXT,
  annual_income VARCHAR(100),
  address TEXT,

  -- Family
  father_name VARCHAR(255),
  father_occupation VARCHAR(255),
  father_contact VARCHAR(20),
  mother_name VARCHAR(255),
  mother_occupation VARCHAR(255),
  mother_contact VARCHAR(20),

  -- Auth: email verification & password reset
  email_verification_token VARCHAR(255),
  email_verified_at TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_phone_2 ON users(phone_number_2);

-- ============================================
-- TABLE: notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- SEQUENCE: accepted user IDs (5000+)
-- ============================================
CREATE SEQUENCE IF NOT EXISTS accepted_user_id_seq START WITH 5000;

-- Set next value to first free id in 5000..99999 (run after initial data if any)
-- SELECT setval('accepted_user_id_seq', (SELECT COALESCE(MAX(id), 4999) FROM users WHERE id >= 5000 AND id < 100000));

-- ============================================
-- TRIGGER: updated_at on users
-- ============================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

-- ============================================
-- OPTIONAL: First admin user (change password!)
-- ============================================
-- INSERT INTO users (email, password, name, role, status)
-- VALUES (
--   'admin@example.com',
--   '$2a$10$...',  -- bcrypt hash of your password
--   'Admin',
--   'admin',
--   'accepted'
-- )
-- ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================
-- List tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- List users columns
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;
