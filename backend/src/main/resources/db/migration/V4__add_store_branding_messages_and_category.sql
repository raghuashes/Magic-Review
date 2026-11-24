-- Flyway Migration V4: Add store business info, welcome message and thank-you message
ALTER TABLE stores ADD COLUMN IF NOT EXISTS business_email VARCHAR(255);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS business_category VARCHAR(100);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS welcome_message TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS thank_you_message TEXT;
