-- V9: Create items table for elemcsoport items
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  elemcsoport_id INT NOT NULL,
  elemjel VARCHAR(255),
  megjegyzes TEXT,
  keszul BIGINT,
  szelesseg DECIMAL(10, 2),
  hosszusag DECIMAL(10, 2),
  magassag DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (elemcsoport_id) REFERENCES elemcsoport(id) ON DELETE CASCADE,
  INDEX idx_elemcsoport_id (elemcsoport_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
