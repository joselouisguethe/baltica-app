-- Migration 007: customer-channel segmentation & attribution
-- See docs/dual-channel-sales-plan.md

-- Where the user came from. Set once at account creation, never overwritten.
--   direct  -> own landing page (Mercado Pago funnel)
--   hotmart -> Hotmart purchase (set only by the verified Hotmart webhook)
--   admin   -> created manually by an administrator
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS acquisition_source VARCHAR(20) NOT NULL DEFAULT 'direct'
    CHECK (acquisition_source IN ('direct', 'hotmart', 'admin'));

-- Marketing attribution (nullable; filled from landing UTM params when present).
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS utm_source       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS utm_medium       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS utm_campaign     VARCHAR(100),
  ADD COLUMN IF NOT EXISTS landing_referrer TEXT;

-- Tag payments by channel too, so revenue reports split cleanly.
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS channel VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_users_acquisition_source ON users(acquisition_source);
