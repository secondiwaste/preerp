-- Add disabled flag to users table
-- Disabled users cannot log in and are immediately logged out
ALTER TABLE users 
ADD COLUMN disabled BOOLEAN NOT NULL DEFAULT FALSE 
AFTER user_level;

-- Create index for faster disabled flag queries
CREATE INDEX idx_disabled ON users(disabled);
