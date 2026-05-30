-- Create raktar table
-- Stores warehouse inventory receipt entries
CREATE TABLE raktar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  datum DATE NOT NULL,
  megnevezes VARCHAR(255) NOT NULL COMMENT 'Rövid megnevezés',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_datum (datum),
  INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
