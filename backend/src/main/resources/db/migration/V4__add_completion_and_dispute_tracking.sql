-- V4: Add independent dual confirmation and dispute tracking to exchange_requests

ALTER TABLE exchange_requests
    ADD COLUMN IF NOT EXISTS provider_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS requester_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS provider_confirmed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS requester_confirmed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS dispute_reason TEXT,
    ADD COLUMN IF NOT EXISTS disputed_by_id BIGINT REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS disputed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_exchange_disputed_by ON exchange_requests(disputed_by_id);
