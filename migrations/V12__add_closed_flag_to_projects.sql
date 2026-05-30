-- Add closed flag to projects table
-- This allows projects to be marked as closed (archived) and filtered from the main list
ALTER TABLE projects
  ADD COLUMN closed BOOLEAN DEFAULT FALSE NOT NULL,
  ADD INDEX idx_closed (closed);
