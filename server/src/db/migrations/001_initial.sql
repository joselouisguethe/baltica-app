-- BÁLTICA Initial Schema

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired')),
  access_expires_at TIMESTAMPTZ NOT NULL,
  access_duration_days INTEGER NOT NULL DEFAULT 60,
  payment_id VARCHAR(100),
  notes TEXT,
  locale VARCHAR(10) DEFAULT 'es-LATAM',
  theme VARCHAR(10) DEFAULT 'system',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  preferred_reminder_time VARCHAR(5) DEFAULT '08:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_day INTEGER NOT NULL DEFAULT 0,
  completed_days INTEGER[] NOT NULL DEFAULT '{}',
  current_step VARCHAR(20) NOT NULL DEFAULT 'start',
  streak INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE
);

CREATE TABLE IF NOT EXISTS day_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_key VARCHAR(20) NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, day_key)
);

CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255) NOT NULL,
  event_type VARCHAR(30) NOT NULL,
  event_detail TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created ON access_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  external_id VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  amount NUMERIC(10,2),
  currency VARCHAR(10) DEFAULT 'COP',
  provider VARCHAR(30) DEFAULT 'mercadopago',
  raw_webhook JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO app_settings (key, value) VALUES ('default_access_days', '60') ON CONFLICT DO NOTHING;

-- Migrations tracking table
CREATE TABLE IF NOT EXISTS _migrations (
  name VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
