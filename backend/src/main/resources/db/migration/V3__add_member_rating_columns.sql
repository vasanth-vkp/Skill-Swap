-- =============================================================================
-- SkillSwap Migration V3: Add Member Rating Columns & Discovery Indexes
-- =============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3, 2) DEFAULT 5.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_rating ON users(average_rating);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
