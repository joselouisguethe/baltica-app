import { Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../types';

export async function getSurvey(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
      'SELECT * FROM satisfaction_surveys WHERE user_id = $1',
      [req.user!.userId]
    );
    res.json({ survey: result.rows[0] || null });
  } catch (err: any) {
    console.error('GetSurvey error:', err);
    res.status(500).json({ error: 'Error al obtener encuesta' });
  }
}

export async function submitSurvey(req: AuthRequest, res: Response) {
  const { first_name, last_name, phone, email, contact_authorized, responses } = req.body;

  if (!first_name || !last_name || !phone || !email) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Check if already submitted
    const existing = await pool.query(
      'SELECT id FROM satisfaction_surveys WHERE user_id = $1',
      [req.user!.userId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Encuesta ya enviada' });
    }

    const result = await pool.query(
      `INSERT INTO satisfaction_surveys (user_id, first_name, last_name, phone, email, contact_authorized, responses)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user!.userId, first_name, last_name, phone, email, contact_authorized || false, JSON.stringify(responses || {})]
    );

    await pool.query(
      `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
       VALUES ($1, $2, 'survey_submitted', 'Encuesta de satisfacción completada')`,
      [req.user!.userId, req.user!.email]
    );

    res.json({ survey: result.rows[0] });
  } catch (err: any) {
    console.error('SubmitSurvey error:', err);
    res.status(500).json({ error: 'Error al guardar encuesta' });
  }
}

// Admin: get all surveys
export async function getAllSurveys(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
      `SELECT s.*, u.email as user_email, u.name as user_name, u.plan_type, u.created_at as enrollment_date
       FROM satisfaction_surveys s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC`
    );
    res.json({ surveys: result.rows });
  } catch (err: any) {
    console.error('GetAllSurveys error:', err);
    res.status(500).json({ error: 'Error al obtener encuestas' });
  }
}
