-- Father and Mother details (admin-only display)
ALTER TABLE users ADD COLUMN IF NOT EXISTS father_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS father_occupation VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS father_contact VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mother_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mother_occupation VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mother_contact VARCHAR(20);
