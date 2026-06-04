-- Migration 008: Journey state machine, start/close surveys, diploma validation

-- 1. Explicit journey state machine on users.
--    registered -> active -> in_progress -> completed -> surveyed -> certified
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS journey_state VARCHAR(20) NOT NULL DEFAULT 'registered'
  CHECK (journey_state IN ('registered','active','in_progress','completed','surveyed','certified'));

-- 2. Unify surveys: one row per (user, type). 'start' = intake baseline, 'close' = satisfaction.
ALTER TABLE satisfaction_surveys
  ADD COLUMN IF NOT EXISTS type VARCHAR(10) NOT NULL DEFAULT 'close'
  CHECK (type IN ('start','close'));

-- The start survey only stores mood/energy responses — personal fields are close-only.
ALTER TABLE satisfaction_surveys ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE satisfaction_surveys ALTER COLUMN last_name  DROP NOT NULL;
ALTER TABLE satisfaction_surveys ALTER COLUMN phone      DROP NOT NULL;
ALTER TABLE satisfaction_surveys ALTER COLUMN email      DROP NOT NULL;

-- Existing rows are satisfaction (close) surveys.
UPDATE satisfaction_surveys SET type = 'close' WHERE type IS NULL;

-- Replace the inline UNIQUE(user_id) (auto-named *_user_id_key) with a composite key
-- so a user can hold one start row and one close row.
ALTER TABLE satisfaction_surveys DROP CONSTRAINT IF EXISTS satisfaction_surveys_user_id_key;
ALTER TABLE satisfaction_surveys
  ADD CONSTRAINT satisfaction_surveys_user_type_key UNIQUE (user_id, type);

-- 3. Diploma validation code (public verification) + auto-issue flag.
ALTER TABLE diplomas
  ADD COLUMN IF NOT EXISTS validation_code UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE diplomas
  ADD COLUMN IF NOT EXISTS issued_automatically BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_diplomas_validation_code ON diplomas(validation_code);

-- 4. Backfill journey_state for existing users from their current data.
UPDATE users u SET journey_state = sub.state
FROM (
  SELECT us.id,
    CASE
      WHEN d.user_id  IS NOT NULL                          THEN 'certified'
      WHEN cs.user_id IS NOT NULL                          THEN 'surveyed'
      WHEN jp.completed_days @> ARRAY[0,1,2,3]              THEN 'completed'
      WHEN COALESCE(array_length(jp.completed_days, 1), 0) > 0
        OR ss.user_id IS NOT NULL                          THEN 'in_progress'
      WHEN us.status = 'active'                            THEN 'active'
      ELSE 'registered'
    END AS state
  FROM users us
  LEFT JOIN journey_progress   jp ON jp.user_id = us.id
  LEFT JOIN diplomas           d  ON d.user_id  = us.id
  LEFT JOIN satisfaction_surveys cs ON cs.user_id = us.id AND cs.type = 'close'
  LEFT JOIN satisfaction_surveys ss ON ss.user_id = us.id AND ss.type = 'start'
) sub
WHERE u.id = sub.id;
