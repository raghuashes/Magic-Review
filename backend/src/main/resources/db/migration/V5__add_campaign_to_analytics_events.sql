ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS campaign VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_analytics_events_campaign ON analytics_events(store_id, campaign);
