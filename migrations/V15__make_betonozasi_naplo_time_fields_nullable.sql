-- Make time fields nullable in betonozasi_naplo table
-- This allows storing NULL instead of 00:00:00 for empty time values
ALTER TABLE betonozasi_naplo 
  MODIFY COLUMN keveres_kezdete TIME NULL DEFAULT NULL,
  MODIFY COLUMN keveres_vege TIME NULL DEFAULT NULL,
  MODIFY COLUMN erkezes_ideje TIME NULL DEFAULT NULL,
  MODIFY COLUMN urites_kezdete TIME NULL DEFAULT NULL,
  MODIFY COLUMN urites_vege TIME NULL DEFAULT NULL;

-- Update existing records: convert 00:00:00 to NULL
UPDATE betonozasi_naplo 
SET keveres_kezdete = NULL 
WHERE keveres_kezdete = '00:00:00';

UPDATE betonozasi_naplo 
SET keveres_vege = NULL 
WHERE keveres_vege = '00:00:00';

UPDATE betonozasi_naplo 
SET erkezes_ideje = NULL 
WHERE erkezes_ideje = '00:00:00';

UPDATE betonozasi_naplo 
SET urites_kezdete = NULL 
WHERE urites_kezdete = '00:00:00';

UPDATE betonozasi_naplo 
SET urites_vege = NULL 
WHERE urites_vege = '00:00:00';
