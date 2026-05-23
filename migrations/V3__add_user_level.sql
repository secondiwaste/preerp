-- Add user_level column to users table
-- User levels: 'user', 'moderator', 'administrator'
ALTER TABLE users 
ADD COLUMN user_level VARCHAR(50) NOT NULL DEFAULT 'user' 
AFTER password;

-- Create index for faster user_level queries
CREATE INDEX idx_user_level ON users(user_level);
