-- Migration 003: Plans, Satisfaction Surveys, and Diplomas

-- 1. Plans table
CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  duration_months INTEGER NOT NULL,
  regular_price NUMERIC(10,2) NOT NULL,
  launch_price NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'COP',
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the 3 plans
INSERT INTO plans (id, name, duration_months, regular_price, launch_price, features) VALUES
  ('basico', 'Plan Básico', 1, 58598, 35000, '[
    "Bienvenida y primeros pasos, Día 1: Grounding para ordenar tus ideas",
    "Día 2: Acción con propósito para no estancarte",
    "Día 3: Autocompasión para no rendirte",
    "Certificado de Bienestar",
    "Video: La Ciencia Detrás del Reto Báltica"
  ]'),
  ('intermedio', 'Plan Intermedio', 3, 175795, 70000, '[
    "Todo lo del Plan Básico",
    "Video extra: Entender más sobre Grounding",
    "Video extra: Un poco más sobre Acción con Propósito",
    "Video extra: La Autocompasión, para entenderlo mejor",
    "Descuento del 25% Reto Báltica 7 días",
    "Descuento del 15% Reto Báltica para el primer combo"
  ]'),
  ('premium', 'Plan Premium', 6, 351590, 140000, '[
    "Todo lo del Plan Intermedio",
    "El código de hábito: La masterclass de Neurociencia",
    "Protocolo de alto rendimiento (10 micro-acciones de impacto inmediato)",
    "De la intención a la acción: 50 micro-acciones con propósito para transformar tu día",
    "30 señales de desgaste que no siempre se ven, no siempre duelen, pero acumulan",
    "Infografías para cada documento",
    "Bono para un amigo: Plan Básico Gratis",
    "Descuento 50% Reto Báltica 7 días",
    "Descuento 30% en descuento Reto Báltica para el primer combo"
  ]')
ON CONFLICT DO NOTHING;

-- 2. Add plan_type to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20) DEFAULT 'basico' REFERENCES plans(id);

-- 3. Update default access duration from 60 to 30 days
ALTER TABLE users ALTER COLUMN access_duration_days SET DEFAULT 30;
UPDATE app_settings SET value = '30' WHERE key = 'default_access_days';

-- 4. Add plan_type to payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20) REFERENCES plans(id);

-- 5. Satisfaction surveys table
CREATE TABLE IF NOT EXISTS satisfaction_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  contact_authorized BOOLEAN NOT NULL DEFAULT FALSE,
  responses JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_satisfaction_surveys_created ON satisfaction_surveys(created_at DESC);

-- 6. Diplomas table
CREATE TABLE IF NOT EXISTS diplomas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
