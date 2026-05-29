-- Migration 004: enforce a UNIQUE constraint on payments.external_id
-- Required by the payments controller, which relies on `ON CONFLICT (external_id)`
-- in createPreference/verifyPayment/webhook. Without a unique index those
-- INSERT ... ON CONFLICT statements throw at runtime.

-- Remove pre-existing duplicate rows sharing an external_id, keeping one per id.
DELETE FROM payments a
USING payments b
WHERE a.external_id IS NOT NULL
  AND a.external_id = b.external_id
  AND a.ctid < b.ctid;

-- Unique index (multiple NULL external_id rows remain allowed in Postgres).
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_external_id_unique
  ON payments(external_id);
