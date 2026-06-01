-- Migration 006: Hotmart integration support
-- See docs/hotmart-integration-plan.md

-- Flag users created via an external purchase who still need to set a password
-- (the "claim account by email" flow). No SMTP required.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_set_password BOOLEAN NOT NULL DEFAULT FALSE;

-- Buyer email reported by the payment provider. Useful when the user_id is not
-- yet known at webhook time, and for support / reconciliation.
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS buyer_email VARCHAR(255);

-- Index for claim-by-email lookups.
CREATE INDEX IF NOT EXISTS idx_users_must_set_password
  ON users(email) WHERE must_set_password = TRUE;

-- NOTE: payments.provider is a free VARCHAR(30) (migration 001), so 'hotmart'
-- is already valid with no further change. The unique index on
-- payments.external_id (migration 004) gives webhook idempotency for free.
