import { Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../types';

// Get user settings (locale, theme, notification preferences)
export async function getUserSettings(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
      `SELECT locale, theme, notifications_enabled, daily_reminder,
              reminder_time, streak_reminder, encouragement
       FROM users WHERE id = $1`,
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const row = result.rows[0];
    res.json({
      settings: {
        locale: row.locale,
        theme: row.theme,
        notifications_enabled: row.notifications_enabled,
        daily_reminder: row.daily_reminder,
        reminder_time: row.reminder_time,
        streak_reminder: row.streak_reminder,
        encouragement: row.encouragement,
      },
    });
  } catch (err: any) {
    console.error('GetUserSettings error:', err);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
}

// Update user settings
export async function updateUserSettings(req: AuthRequest, res: Response) {
  const {
    locale,
    theme,
    notifications_enabled,
    daily_reminder,
    reminder_time,
    streak_reminder,
    encouragement,
  } = req.body;

  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (locale !== undefined) {
    fields.push(`locale = $${idx++}`);
    values.push(locale);
  }
  if (theme !== undefined) {
    fields.push(`theme = $${idx++}`);
    values.push(theme);
  }
  if (notifications_enabled !== undefined) {
    fields.push(`notifications_enabled = $${idx++}`);
    values.push(notifications_enabled);
  }
  if (daily_reminder !== undefined) {
    fields.push(`daily_reminder = $${idx++}`);
    values.push(daily_reminder);
  }
  if (reminder_time !== undefined) {
    fields.push(`reminder_time = $${idx++}`);
    values.push(reminder_time);
  }
  if (streak_reminder !== undefined) {
    fields.push(`streak_reminder = $${idx++}`);
    values.push(streak_reminder);
  }
  if (encouragement !== undefined) {
    fields.push(`encouragement = $${idx++}`);
    values.push(encouragement);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }

  values.push(req.user!.userId);

  try {
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING locale, theme, notifications_enabled, daily_reminder,
                 reminder_time, streak_reminder, encouragement`,
      values
    );

    const row = result.rows[0];
    res.json({
      settings: {
        locale: row.locale,
        theme: row.theme,
        notifications_enabled: row.notifications_enabled,
        daily_reminder: row.daily_reminder,
        reminder_time: row.reminder_time,
        streak_reminder: row.streak_reminder,
        encouragement: row.encouragement,
      },
    });
  } catch (err: any) {
    console.error('UpdateUserSettings error:', err);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
}
