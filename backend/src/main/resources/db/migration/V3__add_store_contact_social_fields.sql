-- Flyway Migration V3: Add contact and social media fields to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(512);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS website_url VARCHAR(512);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(512);
