-- V8: Remove unused fields from elemcsoport table
ALTER TABLE elemcsoport
  DROP COLUMN leiras,
  DROP COLUMN mennyiseg,
  DROP COLUMN egyseg,
  DROP COLUMN megjegyzes;
