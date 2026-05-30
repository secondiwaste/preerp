-- Add szallitasi_koltseg field to raktar table
ALTER TABLE raktar 
ADD COLUMN szallitasi_koltseg DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'Szállítási költség' AFTER megnevezes;
