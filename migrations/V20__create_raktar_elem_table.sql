-- Create raktar_elem table
-- Stores items/products for each warehouse receipt entry
CREATE TABLE raktar_elem (
  id INT AUTO_INCREMENT PRIMARY KEY,
  raktar_id INT NOT NULL,
  megnevezes VARCHAR(255) NOT NULL COMMENT 'Megnevezés',
  mennyiseg DECIMAL(10,3) NULL DEFAULT NULL COMMENT 'Mennyiség',
  mertekegyseg VARCHAR(50) NULL DEFAULT NULL COMMENT 'Mértékegység',
  netto_egysegar DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'Nettó egységár',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (raktar_id) REFERENCES raktar(id) ON DELETE CASCADE,
  INDEX idx_raktar_id (raktar_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
