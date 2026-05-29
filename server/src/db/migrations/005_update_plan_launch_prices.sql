-- Migration 005: set launch (charged) prices to the 45k/90k/120k tier.
-- Migration 003 seeds with ON CONFLICT DO NOTHING, so existing rows keep their
-- old prices; this migration updates them explicitly.

UPDATE plans SET launch_price = 45000  WHERE id = 'basico';
UPDATE plans SET launch_price = 90000  WHERE id = 'intermedio';
UPDATE plans SET launch_price = 120000 WHERE id = 'premium';
