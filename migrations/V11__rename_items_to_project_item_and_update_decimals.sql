-- V11: Rename items table to project_item and update decimal precision
-- Rename the table
RENAME TABLE items TO project_item;

-- Modify decimal columns from (10,2) to (10,3)
ALTER TABLE project_item
  MODIFY COLUMN szelesseg DECIMAL(10, 3),
  MODIFY COLUMN hosszusag DECIMAL(10, 3),
  MODIFY COLUMN magassag DECIMAL(10, 3);
