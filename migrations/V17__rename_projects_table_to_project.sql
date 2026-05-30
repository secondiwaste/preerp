-- V17: Rename projects table to project
-- This migration renames the projects table to singular form 'project'
-- Foreign key references will be automatically updated by MySQL

RENAME TABLE projects TO project;
