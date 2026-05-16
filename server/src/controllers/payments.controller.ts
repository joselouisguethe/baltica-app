import { Request, Response } from 'express';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { pool } from '../config/db';

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Plan configs
const PLAN_CONFIG: Record<string, { title: string; price: number; days: number }> = {
  basico:     { title: 'Báltica - Plan Básico',     price: 35000,  days: 30 },
  intermedio: { title: 'Báltica - Plan Intermedio',  price: 70000,  days: 90 },
  premium:    { title: 'Báltica - Plan Premium',     price: 140000, days: 180 },
};

// Create MercadoPago Checkout Pro preference
export async function createPreference(req: Request & { user?: any }, res: Response) {
  const userId = req.user?.userId;
  const userEmail = req.user?.email;
  const planType = (req.body?.plan_type || 'basico') as string;

  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const plan = PLAN_CONFIG[planType] || PLAN_CONFIG.basico;

  try {
    const preference = new Preference(mpClient);
    const result = await preference.create({
      body: {
        items: [
          {
            id: `baltica-${planType}`,
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
          success: `${FRONTEND_URL}/payment?status=approved&plan=${planType}`,
          failure: `${FRONTEND_URL}/payment?status=failed`,
          pending: `${FRONTEND_URL}/payment?status=pending`,
        },
        auto_return: 'approved',
        external_reference: `${userId}:${planType}`,
        notification_url: BACKEND_URL !== 'http://localhost:3001' ? `${BACKEND_URL}/api/payments/webhook` : undefined,
      },
    });

    res.json({ init_point: result.init_point });
  } catch (err: any) {
    console.error('CreatePreference error:', err);
    res.status(500).json({ error: 'Error al crear preferencia de pago' });
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
      const planType = refParts[1] || 'basico';
      const plan = PLAN_CONFIG[planType] || PLAN_CONFIG.basico;

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
        const planType = refParts[1] || 'basico';
        const plan = PLAN_CONFIG[planType] || PLAN_CONFIG.basico;

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

