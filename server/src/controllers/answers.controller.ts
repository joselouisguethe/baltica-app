import { Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../types';

export async function getAnswers(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
      'SELECT * FROM day_answers WHERE user_id = $1 ORDER BY day_key',
      [req.user!.userId]
    );
    // Convert to { welcome: {...}, day1: {...}, ... } format
    const answers: Record<string, any> = {};
    for (const row of result.rows) {
      answers[row.day_key] = row.answers;
    }
    res.json({ answers });
  } catch (err: any) {
    console.error('GetAnswers error:', err);
    res.status(500).json({ error: 'Error al obtener respuestas' });
  }
}

export async function upsertAnswers(req: AuthRequest, res: Response) {
  const { dayKey } = req.params;
  const { answers } = req.body;

  if (!answers) {
    return res.status(400).json({ error: 'Respuestas requeridas' });
  }

  const validKeys = ['welcome', 'day1', 'day2', 'day3'];
  if (!validKeys.includes(dayKey)) {
    return res.status(400).json({ error: 'Clave de día inválida' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO day_answers (user_id, day_key, answers)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, day_key)
       DO UPDATE SET answers = $3, updated_at = NOW()
       RETURNING *`,
      [req.user!.userId, dayKey, JSON.stringify(answers)]
    );

    await pool.query(
      `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
       VALUES ($1, $2, 'form_submitted', $3)`,
      [req.user!.userId, req.user!.email, `Respuestas guardadas para ${dayKey}`]
    );

    res.json({ answer: result.rows[0] });
  } catch (err: any) {
    console.error('UpsertAnswers error:', err);
    res.status(500).json({ error: 'Error al guardar respuestas' });
  }
}
