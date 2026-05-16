import { Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../types';

export async function getSettings(_req: AuthRequest, res: Response) {
  try {
    const result = await pool.query('SELECT * FROM app_settings');
    const settings: Record<string, string> = {};
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }
    res.json({ settings });
  } catch (err: any) {
    console.error('GetSettings error:', err);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
}

export async function updateSettings(req: AuthRequest, res: Response) {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({ error: 'Clave y valor requeridos' });
  }

  try {
    await pool.query(
      `INSERT INTO app_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2`,
      [key, String(value)]
    );
    res.json({ message: 'Configuración actualizada' });
  } catch (err: any) {
    console.error('UpdateSettings error:', err);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
}
