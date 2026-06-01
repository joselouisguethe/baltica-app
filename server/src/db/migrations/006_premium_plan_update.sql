-- Migration 006: Plan Premium update.
-- Migrations 003/005 use ON CONFLICT DO NOTHING / only touch launch_price, so
-- already-seeded rows need an explicit update.
--   duration: 8 -> 12 months (access = 360 days)
--   regular price:  640.000 -> 1.080.000 COP
--   launch (charged) price: 120.000 -> 180.000 COP

UPDATE plans
SET duration_months = 12,
    regular_price   = 1080000,
    launch_price    = 180000
WHERE id = 'premium';
