import { Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../types';
import { advanceState } from '../lib/state';
import { issueDiplomaForUser } from './diplomas.controller';

type SurveyType = 'start' | 'close';

function normalizeType(raw: any): SurveyType {
  return raw === 'start' ? 'start' : 'close';
}

// GET /api/surveys?type=start|close  (defaults to close for backward compatibility)
export async function getSurvey(req: AuthRequest, res: Response) {
  const type = normalizeType(req.query.type);
  try {
    const result = await pool.query(
      'SELECT * FROM satisfaction_surveys WHERE user_id = $1 AND type = $2',
      [req.user!.userId, type],
    );
    res.json({ survey: result.rows[0] || null });
  } catch (err: any) {
    console.error('GetSurvey error:', err);
    res.status(500).json({ error: 'Error al obtener encuesta' });
  }
}

export async function submitSurvey(req: AuthRequest, res: Response) {
  const type = normalizeType(req.body.type);
  if (type === 'start') return submitStartSurvey(req, res);
  return submitCloseSurvey(req, res);
}

// Mandatory intake survey (mood/energy baseline). Idempotent so navigating
// back and forth in the Day-0 flow does not error. Advances state to 'active'.
async function submitStartSurvey(req: AuthRequest, res: Response) {
  const { responses } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO satisfaction_surveys (user_id, type, responses)
       VALUES ($1, 'start', $2)
       ON CONFLICT (user_id, type)
       DO UPDATE SET responses = EXCLUDED.responses
       RETURNING *`,
      [req.user!.userId, JSON.stringify(responses || {})],
    );

    await advanceState(req.user!.userId, 'active');

    await pool.query(
      `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
       VALUES ($1, $2, 'survey_submitted', 'Encuesta de inicio completada')`,
      [req.user!.userId, req.user!.email],
    );

    res.json({ survey: result.rows[0] });
  } catch (err: any) {
    console.error('SubmitStartSurvey error:', err);
    res.status(500).json({ error: 'Error al guardar encuesta de inicio' });
  }
}

// Mandatory closing satisfaction survey. On submit, advance to 'surveyed' and
// automatically issue the diploma (-> 'certified') in a single transaction.
async function submitCloseSurvey(req: AuthRequest, res: Response) {
  const { first_name, last_name, phone, email, contact_authorized, responses } = req.body;

  if (!first_name || !last_name || !phone || !email) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const client = await pool.connect();
  try {
    const existing = await client.query(
      "SELECT id FROM satisfaction_surveys WHERE user_id = $1 AND type = 'close'",
      [req.user!.userId],
    );
    if (existing.rows.length > 0) {
      // `finally` releases the client — do not release here (avoids double release).
      return res.status(400).json({ error: 'Encuesta ya enviada' });
    }

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO satisfaction_surveys
         (user_id, type, first_name, last_name, phone, email, contact_authorized, responses)
       VALUES ($1, 'close', $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user!.userId,
        first_name,
        last_name,
        phone,
        email,
        contact_authorized || false,
        JSON.stringify(responses || {}),
      ],
    );

    await client.query(
      `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
       VALUES ($1, $2, 'survey_submitted', 'Encuesta de satisfacción completada')`,
      [req.user!.userId, req.user!.email],
    );

    await advanceState(req.user!.userId, 'surveyed', client);

    // Automatic diploma issuance — best effort. If the user has not completed
    // the days yet, this returns an error which we ignore (state stays 'surveyed').
    let diploma = null;
    const issued = await issueDiplomaForUser(req.user!.userId, req.user!.email, {
      automatic: true,
      client,
    });
    if (issued.diploma) diploma = issued.diploma;

    await client.query('COMMIT');
    res.json({ survey: result.rows[0], diploma });
  } catch (err: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('SubmitCloseSurvey error:', err);
    res.status(500).json({ error: 'Error al guardar encuesta' });
  } finally {
    client.release();
  }
}

// Admin: get all surveys
export async function getAllSurveys(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
      `SELECT s.*, u.email as user_email, u.name as user_name, u.plan_type, u.created_at as enrollment_date
       FROM satisfaction_surveys s
       JOIN users u ON s.user_id = u.id
       WHERE s.type = 'close'
       ORDER BY s.created_at DESC`,
    );
    res.json({ surveys: result.rows });
  } catch (err: any) {
    console.error('GetAllSurveys error:', err);
    res.status(500).json({ error: 'Error al obtener encuestas' });
  }
}
