-- Serial IDs from 5000 for accepted users. Run once.
CREATE SEQUENCE IF NOT EXISTS accepted_user_id_seq START WITH 5000;

-- Set sequence so next value is first free id in 5000, 5001, ... (ignore random ids like 887458)
SELECT setval('accepted_user_id_seq', (SELECT COALESCE(MAX(id), 4999) FROM users WHERE id >= 5000 AND id < 100000));
