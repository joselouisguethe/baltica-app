import { Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../types';

export async function getProgress(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
      'SELECT * FROM journey_progress WHERE user_id = $1',
      [req.user!.userId]
    );
    if (result.rows.length === 0) {
      // Create default progress
      const insert = await pool.query(
        'INSERT INTO journey_progress (user_id) VALUES ($1) RETURNING *',
        [req.user!.userId]
      );
      return res.json({ progress: insert.rows[0] });
    }
    res.json({ progress: result.rows[0] });
  } catch (err: any) {
    console.error('GetProgress error:', err);
    res.status(500).json({ error: 'Error al obtener progreso' });
  }
}

export async function updateProgress(req: AuthRequest, res: Response) {
  const { current_day, current_step } = req.body;
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (current_day !== undefined) { fields.push(`current_day = $${idx++}`); values.push(current_day); }
  if (current_step !== undefined) { fields.push(`current_step = $${idx++}`); values.push(current_step); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }

  values.push(req.user!.userId);

  try {
    const result = await pool.query(
      `UPDATE journey_progress SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`,
      values
    );
    res.json({ progress: result.rows[0] });
  } catch (err: any) {
    console.error('UpdateProgress error:', err);
    res.status(500).json({ error: 'Error al actualizar progreso' });
  }
}

export async function completeDay(req: AuthRequest, res: Response) {
  const { day } = req.body;
  if (day === undefined) {
    return res.status(400).json({ error: 'Día requerido' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM journey_progress WHERE user_id = $1',
      [req.user!.userId]
    );
    const progress = result.rows[0];
    if (!progress) {
      return res.status(404).json({ error: 'Progreso no encontrado' });
    }

    const completedDays: number[] = progress.completed_days || [];
    if (!completedDays.includes(day)) {
      completedDays.push(day);
    }
    // Day 0 completion auto-completes day 1 (merged into Día 1)
    if (day === 0 && !completedDays.includes(1)) {
      completedDays.push(1);
    }

    const today = new Date().toISOString().split('T')[0];
    let newStreak = progress.streak;

    if (progress.last_completed_date) {
      const lastDate = new Date(progress.last_completed_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak = progress.streak + 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    // When day 0 completes, skip to day 2 (day 1 is part of day 0 now)
    const newCurrentDay = day === 0 ? 2 : Math.min(day + 1, 3);

    const updated = await pool.query(
      `UPDATE journey_progress
       SET completed_days = $1, current_day = $2, current_step = 'start', streak = $3, last_completed_date = $4
       WHERE user_id = $5 RETURNING *`,
      [completedDays, newCurrentDay, newStreak, today, req.user!.userId]
    );

    // Log
    await pool.query(
      `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
       VALUES ($1, $2, 'day_completed', $3)`,
      [req.user!.userId, req.user!.email, `Día ${day} completado`]
    );

    res.json({ progress: updated.rows[0] });
  } catch (err: any) {
    console.error('CompleteDay error:', err);
    res.status(500).json({ error: 'Error al completar día' });
  }
}
