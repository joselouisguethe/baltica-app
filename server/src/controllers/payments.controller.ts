import { Request, Response } from 'express';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import crypto from 'crypto';
import { pool } from '../config/db';

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Fallback plan configs — used only if the `plans` table is unavailable.
// The `plans` table (migration 003) is the authoritative source of truth.
const PLAN_CONFIG: Record<string, { title: string; price: number; days: number }> = {
  basico:     { title: 'Báltica - Plan Básico',     price: 45000,  days: 30 },
  intermedio: { title: 'Báltica - Plan Intermedio',  price: 90000,  days: 90 },
  premium:    { title: 'Báltica - Plan Premium',     price: 120000, days: 180 },
};

// Resolve a plan from the DB (single source of truth), falling back to PLAN_CONFIG.
// Returns the canonical planType so callers never trust client-supplied pricing.
async function getPlan(
  planType: string
): Promise<{ planType: string; title: string; price: number; days: number }> {
  const id = PLAN_CONFIG[planType] ? planType : 'basico';
  const fallback = PLAN_CONFIG[id];
  try {
    const { rows } = await pool.query(
      `SELECT id, name, launch_price, duration_months FROM plans WHERE id = $1 AND is_active = TRUE`,
      [id]
    );
    if (rows[0]) {
      return {
        planType: rows[0].id,
        title: `Báltica - ${rows[0].name}`,
        price: Number(rows[0].launch_price),
        days: Number(rows[0].duration_months) * 30,
      };
    }
  } catch (err) {
    console.error('getPlan DB error, using fallback config:', err);
  }
  return { planType: id, title: fallback.title, price: fallback.price, days: fallback.days };
}

// Verify the x-signature HMAC sent by MercadoPago webhooks.
// See: https://www.mercadopago.com.co/developers/en/docs/your-integrations/notifications/webhooks
function verifyWebhookSignature(req: Request): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';
  if (!secret) {
    console.warn('MERCADOPAGO_WEBHOOK_SECRET not set — skipping webhook signature verification');
    return true; // dev convenience; set the secret in production
  }

  const signature = req.headers['x-signature'] as string | undefined;
  const requestId = req.headers['x-request-id'] as string | undefined;
  const dataId = (req.query['data.id'] as string) || req.body?.data?.id;
  if (!signature || !dataId) return false;

  const parts = Object.fromEntries(
    signature.split(',').map((p) => {
      const idx = p.indexOf('=');
      return [p.slice(0, idx).trim(), p.slice(idx + 1).trim()];
    })
  );
  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  let manifest = `id:${String(dataId).toLowerCase()};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${ts};`;

  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

// Public: list active plans so the frontend renders the exact charged price.
export async function getPlans(_req: Request, res: Response) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, duration_months, regular_price, launch_price, currency, features
       FROM plans WHERE is_active = TRUE ORDER BY launch_price ASC`
    );
    res.json({ plans: rows });
  } catch (err) {
    console.error('getPlans error:', err);
    res.status(500).json({ error: 'Error al obtener planes' });
  }
}

// Create MercadoPago Checkout Pro preference
export async function createPreference(req: Request & { user?: any }, res: Response) {
  const userId = req.user?.userId;
  const userEmail = req.user?.email;
  const planType = (req.body?.plan_type || 'basico') as string;

  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const plan = await getPlan(planType);

  try {
    const preference = new Preference(mpClient);
    const result = await preference.create({
      body: {
        items: [
          {
            id: `baltica-${plan.planType}`,
            title: plan.title,
            quantity: 1,
            unit_price: plan.price,
            currency_id: 'COP',
          },
        ],
        payer: {
          email: userEmail,
        },
        back_urls: {
          success: `${FRONTEND_URL}/payment?status=approved&plan=${plan.planType}`,
          failure: `${FRONTEND_URL}/payment?status=failed`,
          pending: `${FRONTEND_URL}/payment?status=pending`,
        },
        auto_return: 'approved',
        external_reference: `${userId}:${plan.planType}`,
        notification_url: BACKEND_URL !== 'http://localhost:3001' ? `${BACKEND_URL}/api/payments/webhook` : undefined,
      },
    });

    res.json({ init_point: result.init_point });
  } catch (err: any) {
    // Log the full MP error so we can see which policy/field failed
    console.error('CreatePreference error:', {
      message: err?.message,
      status: err?.status,
      code: err?.code,
      blocked_by: err?.blocked_by,
      cause: err?.cause,
      tokenPrefix: (process.env.MERCADOPAGO_ACCESS_TOKEN || '').slice(0, 8),
      planType,
      buyerEmail: userEmail,
    });
    const isPolicyError = err?.code === 'PA_UNAUTHORIZED_RESULT_FROM_POLICIES';
    res.status(500).json({
      error: isPolicyError
        ? 'La cuenta de Mercado Pago no está autorizada para crear este pago. Verifica el access token, el país de la cuenta (debe ser CO para pesos colombianos) y que la cuenta esté activada para recibir pagos.'
        : 'Error al crear preferencia de pago',
      mp_code: err?.code,
    });
  }
}

// Verify payment status with MercadoPago
export async function verifyPayment(req: Request & { user?: any }, res: Response) {
  const { paymentId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const payment = new Payment(mpClient);
    const result = await payment.get({ id: paymentId });

    if (result.status === 'approved') {
      // Parse plan from external_reference (format: "userId:planType")
      const refParts = result.external_reference?.split(':') || [];
      const plan = await getPlan(refParts[1] || 'basico');
      const planType = plan.planType;

      // Activate user with plan-based duration
      const now = new Date();
      const expiresAt = new Date(now.getTime() + plan.days * 24 * 60 * 60 * 1000);

      await pool.query(
        `UPDATE users SET status = 'active', payment_id = $1, access_expires_at = $2, plan_type = $3 WHERE id = $4`,
        [String(result.id), expiresAt.toISOString(), planType, userId]
      );

      // Record payment
      await pool.query(
        `INSERT INTO payments (user_id, external_id, status, amount, currency, provider, plan_type)
         VALUES ($1, $2, 'completed', $3, $4, 'mercadopago', $5)
         ON CONFLICT (external_id) DO NOTHING`,
        [userId, String(result.id), result.transaction_amount, result.currency_id, planType]
      );

      // Log event
      await pool.query(
        `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
         VALUES ($1, $2, 'payment_event', $3)`,
        [userId, req.user.email, `MercadoPago payment ${result.id} approved (${planType})`]
      );
    }

    res.json({ status: result.status, payment_id: String(result.id), plan_type: result.external_reference?.split(':')[1] || 'basico' });
  } catch (err: any) {
    console.error('VerifyPayment error:', err);
    res.status(500).json({ error: 'Error al verificar pago' });
  }
}

// MercadoPago webhook
export async function webhook(req: Request, res: Response) {
  if (!verifyWebhookSignature(req)) {
    console.warn('Rejected MercadoPago webhook: invalid signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { type, data } = req.body;

  try {
    if (type === 'payment' && data?.id) {
      // Store raw webhook
      await pool.query(
        `INSERT INTO payments (external_id, status, raw_webhook)
         VALUES ($1, 'received', $2)
         ON CONFLICT (external_id) DO UPDATE SET raw_webhook = $2`,
        [String(data.id), JSON.stringify(req.body)]
      );

      // Fetch payment details from MP
      const payment = new Payment(mpClient);
      const result = await payment.get({ id: data.id });

      if (result.status === 'approved' && result.external_reference) {
        const refParts = result.external_reference.split(':');
        const userId = refParts[0];
        const plan = await getPlan(refParts[1] || 'basico');
        const planType = plan.planType;

        const now = new Date();
        const expiresAt = new Date(now.getTime() + plan.days * 24 * 60 * 60 * 1000);

        // Activate user
        await pool.query(
          `UPDATE users SET status = 'active', payment_id = $1, access_expires_at = $2, plan_type = $3 WHERE id = $4`,
          [String(result.id), expiresAt.toISOString(), planType, userId]
        );

        // Update payment record
        await pool.query(
          `UPDATE payments SET status = 'completed', user_id = $1, amount = $2, currency = $3, provider = 'mercadopago', plan_type = $4
           WHERE external_id = $5`,
          [userId, result.transaction_amount, result.currency_id, planType, String(result.id)]
        );

        // Log
        const userResult = await pool.query(`SELECT email FROM users WHERE id = $1`, [userId]);
        const email = userResult.rows[0]?.email || '';
        await pool.query(
          `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
           VALUES ($1, $2, 'payment_event', $3)`,
          [userId, email, `Webhook: MercadoPago payment ${result.id} approved`]
        );
      }
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Error procesando webhook' });
  }
}

