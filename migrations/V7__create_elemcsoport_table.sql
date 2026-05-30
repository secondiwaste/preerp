-- V7: Create elemcsoport table for project element groups
CREATE TABLE IF NOT EXISTS elemcsoport (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  nev VARCHAR(255) NOT NULL,
  leiras TEXT,
  mennyiseg DECIMAL(10, 2),
  egyseg VARCHAR(50),
  megjegyzes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
