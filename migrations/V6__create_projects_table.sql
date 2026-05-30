-- Create projects table
-- Stores project information accessible to all users, editable by moderators and administrators
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  munkaszam VARCHAR(100) NOT NULL UNIQUE,
  munka_megnevezes VARCHAR(255) NOT NULL,
  reszletek TEXT,
  megrendelo_neve VARCHAR(255),
  megrendelo_adatai TEXT,
  szallitasi_cim TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_munkaszam (munkaszam),
  INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
