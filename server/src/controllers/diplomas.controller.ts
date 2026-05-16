import { Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../types';

export async function getDiploma(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
      'SELECT * FROM diplomas WHERE user_id = $1',
      [req.user!.userId]
    );
    res.json({ diploma: result.rows[0] || null });
  } catch (err: any) {
    console.error('GetDiploma error:', err);
    res.status(500).json({ error: 'Error al obtener diploma' });
  }
}

export async function issueDiploma(req: AuthRequest, res: Response) {
  try {
    // Check if already issued
    const existing = await pool.query(
      'SELECT id FROM diplomas WHERE user_id = $1',
      [req.user!.userId]
    );
    if (existing.rows.length > 0) {
      return res.json({ diploma: existing.rows[0] });
    }

    // Check survey completed
    const survey = await pool.query(
      'SELECT id FROM satisfaction_surveys WHERE user_id = $1',
      [req.user!.userId]
    );
    if (survey.rows.length === 0) {
      return res.status(400).json({ error: 'Debes completar la encuesta antes de obtener el diploma' });
    }

    // Check course completed (days 0,1,2,3)
    const progress = await pool.query(
      'SELECT completed_days FROM journey_progress WHERE user_id = $1',
      [req.user!.userId]
    );
    if (!progress.rows.length) {
      return res.status(400).json({ error: 'No se encontró progreso del usuario' });
    }
    const completed = progress.rows[0].completed_days || [];
    if (!completed.includes(0) || !completed.includes(1) || !completed.includes(2) || !completed.includes(3)) {
      return res.status(400).json({ error: 'Debes completar los 3 días del reto' });
    }

    const result = await pool.query(
      `INSERT INTO diplomas (user_id) VALUES ($1) RETURNING *`,
      [req.user!.userId]
    );

    await pool.query(
      `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
       VALUES ($1, $2, 'diploma_issued', 'Diploma emitido')`,
      [req.user!.userId, req.user!.email]
    );

    res.json({ diploma: result.rows[0] });
  } catch (err: any) {
    console.error('IssueDiploma error:', err);
    res.status(500).json({ error: 'Error al emitir diploma' });
  }
}
