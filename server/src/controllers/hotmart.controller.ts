import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { pool } from '../config/db';
import { env } from '../config/env';

// Fallback plan durations — the `plans` table is the source of truth (see
// payments.controller.getPlan). Mirrors PLAN_CONFIG there.
const PLAN_FALLBACK: Record<string, { days: number }> = {
  basico: { days: 30 },
  intermedio: { days: 90 },
  premium: { days: 360 },
};

// Maps a Hotmart product/offer to our internal plan_type.
//   - productId = data.product.id (numeric) from the webhook payload — 7769917.
//   - offerCode = data.purchase.offer.code (ALPHANUMERIC, e.g. "w32kp5a7").
// Two key shapes are supported (resolvePlanType tries them in order):
//   1. `${productId}:${offerCode}` — strictest, scoped to this product.
//   2. `${offerCode}`              — offer-code-only fallback. Offer codes are unique,
//      so this still maps correctly even if the product id ever differs from 7769917
//      (prevents a silent downgrade of every purchase to 'basico').
// Offer codes configured in Hotmart → Producto → Ofertas (see HOTMART_SETUP.md).
const HOTMART_PLAN_MAP: Record<string, 'basico' | 'intermedio' | 'premium'> = {
  '7769917:default': 'basico',
  // Product-scoped
  '7769917:w32kp5a7': 'basico',
  '7769917:d67r8at1': 'intermedio',
  '7769917:8wk6nu6z': 'premium',
  // Offer-code-only fallback (robust to product-id changes)
  'w32kp5a7': 'basico',
  'd67r8at1': 'intermedio',
  '8wk6nu6z': 'premium',
};

function resolvePlanType(productId?: string | number, offerCode?: string): 'basico' | 'intermedio' | 'premium' {
  const pid = productId != null ? String(productId) : '';
  if (offerCode && HOTMART_PLAN_MAP[`${pid}:${offerCode}`]) return HOTMART_PLAN_MAP[`${pid}:${offerCode}`];
  if (offerCode && HOTMART_PLAN_MAP[offerCode]) return HOTMART_PLAN_MAP[offerCode];
  if (HOTMART_PLAN_MAP[`${pid}:default`]) return HOTMART_PLAN_MAP[`${pid}:default`];
  return 'basico';
}

// Resolve plan duration (days) from the DB, falling back to PLAN_FALLBACK.
async function getPlanDays(planType: string): Promise<number> {
  try {
    const { rows } = await pool.query(
      `SELECT duration_months FROM plans WHERE id = $1 AND is_active = TRUE`,
      [planType]
    );
    if (rows[0]) return Number(rows[0].duration_months) * 30;
  } catch (err) {
    console.error('Hotmart getPlanDays DB error, using fallback:', err);
  }
  return PLAN_FALLBACK[planType]?.days ?? 30;
}

// Authenticate the webhook via Hotmart's hottok (sent in header or body).
function verifyHottok(req: Request): boolean {
  const secret = env.HOTMART_HOTTOK;
  if (!secret) {
    console.warn('HOTMART_HOTTOK not set — skipping Hotmart webhook verification (dev only)');
    return true; // dev convenience; set the token in production
  }
  const received =
    (req.headers['x-hotmart-hottok'] as string | undefined) ||
    (req.body?.hottok as string | undefined) ||
    '';
  if (!received) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(secret));
  } catch {
    return false;
  }
}

// Extract the fields we need from the (defensively-read) Hotmart 2.0 payload.
function parsePayload(body: any) {
  const data = body?.data || body || {};
  const purchase = data.purchase || {};
  const buyer = data.buyer || {};
  const product = data.product || {};
  const offer = purchase.offer || data.offer || {};
  const price = purchase.price || {};

  return {
    event: body?.event || data?.event || '',
    transaction: purchase.transaction || data.transaction || body?.id || '',
    email: (buyer.email || '').toLowerCase().trim(),
    name: buyer.name || (buyer.email ? String(buyer.email).split('@')[0] : 'Cliente Báltica'),
    productId: product.id,
    offerCode: offer.code || offer.key,
    amount: price.value != null ? Number(price.value) : null,
    currency: price.currency_value || price.currency_code || 'COP',
  };
}

const APPROVAL_EVENTS = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE'];
const CANCEL_EVENTS = ['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_PROTEST'];

export async function hotmartWebhook(req: Request, res: Response) {
  if (!verifyHottok(req)) {
    console.warn('Rejected Hotmart webhook: invalid hottok');
    return res.status(401).json({ error: 'Invalid hottok' });
  }

  const p = parsePayload(req.body);

  if (!p.transaction) {
    return res.status(400).json({ error: 'Missing transaction id' });
  }

  try {
    // Idempotency: store the raw webhook keyed by transaction (external_id).
    await pool.query(
      `INSERT INTO payments (external_id, status, provider, channel, buyer_email, raw_webhook)
       VALUES ($1, 'received', 'hotmart', 'hotmart', $2, $3)
       ON CONFLICT (external_id) DO UPDATE SET raw_webhook = $3`,
      [String(p.transaction), p.email || null, JSON.stringify(req.body)]
    );

    if (APPROVAL_EVENTS.includes(p.event)) {
      if (!p.email) return res.status(200).json({ received: true, note: 'no buyer email' });

      const planType = resolvePlanType(p.productId, p.offerCode);
      const days = await getPlanDays(planType);
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      // Find existing user by email.
      const existing = await pool.query('SELECT id, acquisition_source FROM users WHERE email = $1', [p.email]);

      let userId: string;
      if (existing.rows[0]) {
        // Activate existing user. Preserve original acquisition_source (first-touch).
        userId = existing.rows[0].id;
        await pool.query(
          `UPDATE users SET status = 'active', payment_id = $1, access_expires_at = $2, plan_type = $3 WHERE id = $4`,
          [String(p.transaction), expiresAt.toISOString(), planType, userId]
        );
      } else {
        // Create a new Hotmart-sourced user who must set their password (claim flow).
        const randomHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
        const created = await pool.query(
          `INSERT INTO users (email, name, password_hash, status, access_expires_at, access_duration_days,
                              plan_type, payment_id, must_set_password, acquisition_source)
           VALUES ($1, $2, $3, 'active', $4, $5, $6, $7, TRUE, 'hotmart') RETURNING id`,
          [p.email, p.name, randomHash, expiresAt.toISOString(), days, planType, String(p.transaction)]
        );
        userId = created.rows[0].id;
        // Initial journey progress (mirrors auth.register).
        await pool.query(`INSERT INTO journey_progress (user_id) VALUES ($1)`, [userId]);
      }

      // Finalize the payment row.
      await pool.query(
        `UPDATE payments SET status = 'completed', user_id = $1, amount = $2, currency = $3,
                             plan_type = $4, buyer_email = $5
         WHERE external_id = $6`,
        [userId, p.amount, p.currency, planType, p.email, String(p.transaction)]
      );

      await pool.query(
        `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
         VALUES ($1, $2, 'payment_event', $3)`,
        [userId, p.email, `Hotmart ${p.event} transaction ${p.transaction} (${planType})`]
      );

      return res.status(200).json({ received: true });
    }

    if (CANCEL_EVENTS.includes(p.event)) {
      await pool.query(`UPDATE payments SET status = 'refunded' WHERE external_id = $1`, [String(p.transaction)]);
      if (p.email) {
        const u = await pool.query('SELECT id FROM users WHERE email = $1', [p.email]);
        if (u.rows[0]) {
          await pool.query(`UPDATE users SET status = 'suspended' WHERE id = $1`, [u.rows[0].id]);
          await pool.query(
            `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
             VALUES ($1, $2, 'payment_event', $3)`,
            [u.rows[0].id, p.email, `Hotmart ${p.event} transaction ${p.transaction} — acceso suspendido`]
          );
        }
      }
      return res.status(200).json({ received: true });
    }

    // Other events (delayed/billet/subscription cancellation): log only.
    console.log(`Hotmart event ${p.event} for transaction ${p.transaction} — no action`);
    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Hotmart webhook error:', err);
    return res.status(500).json({ error: 'Error procesando webhook de Hotmart' });
  }
}
