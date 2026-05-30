-- Change time fields from TIME to VARCHAR(5) in betonozasi_naplo table
-- This allows storing time in HH:MM format as plain text
ALTER TABLE betonozasi_naplo 
  MODIFY COLUMN keveres_kezdete VARCHAR(5) NULL DEFAULT NULL,
  MODIFY COLUMN keveres_vege VARCHAR(5) NULL DEFAULT NULL,
  MODIFY COLUMN erkezes_ideje VARCHAR(5) NULL DEFAULT NULL,
  MODIFY COLUMN urites_kezdete VARCHAR(5) NULL DEFAULT NULL,
  MODIFY COLUMN urites_vege VARCHAR(5) NULL DEFAULT NULL;
