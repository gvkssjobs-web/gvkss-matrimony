-- Optional second phone number
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number_2 VARCHAR(20);
