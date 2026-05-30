-- Make raktar megnevezes field nullable
-- Allows creating entries without description, to be filled in via inline editing
ALTER TABLE raktar 
MODIFY COLUMN megnevezes VARCHAR(255) NULL DEFAULT NULL COMMENT 'Rövid megnevezés';
