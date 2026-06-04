import { Request, Response } from 'express';
import { PoolClient } from 'pg';
import { pool } from '../config/db';
import { AuthRequest } from '../types';
import { advanceState } from '../lib/state';

type Queryable = Pick<PoolClient, 'query'>;

interface IssueResult {
  diploma?: any;
  error?: string;
}

/**
 * Issue a diploma for a user, enforcing the full set of validations:
 * close survey submitted + all 3 days completed. Idempotent — returns the
 * existing diploma if one is already issued. Advances state to 'certified'.
 * Reusable from both the manual endpoint and the automatic close-survey flow.
 */
export async function issueDiplomaForUser(
  userId: string,
  userEmail: string,
  opts: { automatic?: boolean; client?: Queryable } = {},
): Promise<IssueResult> {
  const client: Queryable = opts.client ?? pool;

  const existing = await client.query('SELECT * FROM diplomas WHERE user_id = $1', [userId]);
  if (existing.rows.length > 0) {
    await advanceState(userId, 'certified', client);
    return { diploma: existing.rows[0] };
  }

  // Close (satisfaction) survey must be submitted first.
  const survey = await client.query(
    "SELECT id FROM satisfaction_surveys WHERE user_id = $1 AND type = 'close'",
    [userId],
  );
  if (survey.rows.length === 0) {
    return { error: 'Debes completar la encuesta antes de obtener el diploma' };
  }

  // All 3 days of the challenge must be completed (days 0,1,2,3).
  const progress = await client.query(
    'SELECT completed_days FROM journey_progress WHERE user_id = $1',
    [userId],
  );
  if (!progress.rows.length) {
    return { error: 'No se encontró progreso del usuario' };
  }
  const completed: number[] = progress.rows[0].completed_days || [];
  if (![0, 1, 2, 3].every((d) => completed.includes(d))) {
    return { error: 'Debes completar los 3 días del reto' };
  }

  const result = await client.query(
    `INSERT INTO diplomas (user_id, issued_automatically) VALUES ($1, $2) RETURNING *`,
    [userId, opts.automatic ?? false],
  );

  await client.query(
    `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
     VALUES ($1, $2, 'diploma_issued', $3)`,
    [userId, userEmail, opts.automatic ? 'Diploma emitido automáticamente' : 'Diploma emitido'],
  );

  await advanceState(userId, 'certified', client);

  // Email delivery is intentionally out of MVP scope (no SMTP configured).
  // The issuance is logged above and the diploma is downloadable in-app.
  console.log(`[diploma] issued for user ${userId} (auto=${!!opts.automatic})`);

  return { diploma: result.rows[0] };
}

export async function getDiploma(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query('SELECT * FROM diplomas WHERE user_id = $1', [req.user!.userId]);
    res.json({ diploma: result.rows[0] || null });
  } catch (err: any) {
    console.error('GetDiploma error:', err);
    res.status(500).json({ error: 'Error al obtener diploma' });
  }
}

export async function issueDiploma(req: AuthRequest, res: Response) {
  try {
    const { diploma, error } = await issueDiplomaForUser(req.user!.userId, req.user!.email);
    if (error) return res.status(400).json({ error });
    res.json({ diploma });
  } catch (err: any) {
    console.error('IssueDiploma error:', err);
    res.status(500).json({ error: 'Error al emitir diploma' });
  }
}

/**
 * Public, unauthenticated certificate verification by validation code.
 * Returns the holder's name and issue date so a third party can confirm authenticity.
 */
export async function validateDiploma(req: Request, res: Response) {
  const { code } = req.params;
  // Guard against malformed codes (uuid) reaching the DB as a cast error.
  if (!/^[0-9a-fA-F-]{36}$/.test(code)) {
    return res.status(404).json({ valid: false });
  }
  try {
    const result = await pool.query(
      `SELECT d.issued_at, d.validation_code, u.name
       FROM diplomas d JOIN users u ON u.id = d.user_id
       WHERE d.validation_code = $1`,
      [code],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ valid: false });
    }
    const row = result.rows[0];
    res.json({
      valid: true,
      name: row.name,
      issued_at: row.issued_at,
      validation_code: row.validation_code,
      program: 'Reto Báltica de 3 Días',
    });
  } catch (err: any) {
    console.error('ValidateDiploma error:', err);
    res.status(500).json({ valid: false, error: 'Error al validar diploma' });
  }
}
