-- Migration V6: Add custom business details and attribute source metadata
ALTER TABLE stores ADD COLUMN IF NOT EXISTS specialties TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS target_customers VARCHAR(255);

ALTER TABLE store_attributes ADD COLUMN IF NOT EXISTS source VARCHAR(30) DEFAULT 'MERCHANT_CREATED';
ALTER TABLE store_attributes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index on store_attributes for efficient store + source filtering
CREATE INDEX IF NOT EXISTS idx_store_attributes_store_source ON store_attributes(store_id, source);
