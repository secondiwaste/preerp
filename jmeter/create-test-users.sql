-- Create test users for JMeter performance testing
-- Password for all users: TestPass123!
-- Password hash generated with bcrypt rounds=10

INSERT INTO users (username, password_hash, user_level, disabled) VALUES
('testuser1', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser2', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser3', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser4', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser5', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser6', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser7', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser8', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser9', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser10', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser11', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser12', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser13', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser14', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser15', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser16', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser17', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser18', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser19', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE),
('testuser20', '$2b$10$rQ8YZqCQxGLqxJ5nP.8sTOW8FjF9cXH5lK4YP6EHhXVN9qYxJ5zKm', 'user', FALSE)
ON DUPLICATE KEY UPDATE username=username;

-- Note: The password hash above is for 'TestPass123!' 
-- You may need to regenerate this hash if your bcrypt configuration differs
