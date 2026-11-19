-- Flyway Migration V2: Add business poster support to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS poster_url VARCHAR(512);
