-- SQL script to fix existing photo URLs that start with "local-"
-- This script sets photo to NULL for entries where photo starts with "local-"
-- The frontend will use /api/photo?userId= to fetch from blob instead

BEGIN;

-- Update photo column: set to NULL if it starts with "local-"
UPDATE users 
SET photo = NULL 
WHERE photo LIKE 'local-%';

-- Also update photo_s3_url if it has invalid local- values
UPDATE users 
SET photo_s3_url = NULL 
WHERE photo_s3_url LIKE 'local-%';

COMMIT;

-- Verify the changes
SELECT id, email, name, 
       CASE 
         WHEN photo LIKE 'local-%' THEN 'NEEDS FIX'
         WHEN photo IS NULL AND photo_blob IS NOT NULL THEN 'OK (using blob)'
         WHEN photo IS NOT NULL THEN 'OK (has URL)'
         ELSE 'NO PHOTO'
       END as photo_status,
       photo, photo_s3_url
FROM users
WHERE photo LIKE 'local-%' OR photo IS NULL
ORDER BY id;
