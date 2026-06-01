import { Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../types';

// Admin: user counts and revenue grouped by acquisition channel, so the team
// can measure cost per customer per channel (direct vs hotmart).
// See docs/dual-channel-sales-plan.md.
export async function getChannelStats(_req: AuthRequest, res: Response) {
  try {
    const users = await pool.query(`
      SELECT acquisition_source AS source,
             COUNT(*)::int AS total_users,
             COUNT(*) FILTER (WHERE status = 'active')::int AS active_users
      FROM users
      WHERE role = 'user'
      GROUP BY acquisition_source
      ORDER BY acquisition_source
    `);

    const revenue = await pool.query(`
      SELECT COALESCE(channel, provider) AS channel,
             COUNT(*)::int AS completed_payments,
             COALESCE(SUM(amount), 0)::numeric AS revenue
      FROM payments
      WHERE status = 'completed'
      GROUP BY COALESCE(channel, provider)
      ORDER BY channel
    `);

    res.json({ users: users.rows, revenue: revenue.rows });
  } catch (err: any) {
    console.error('getChannelStats error:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas por canal' });
  }
}
