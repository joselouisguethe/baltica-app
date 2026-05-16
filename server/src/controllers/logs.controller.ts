import { Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../types';

export async function getLogs(req: AuthRequest, res: Response) {
  const { user_id, event_type, limit = '100', offset = '0' } = req.query;

  let query = 'SELECT * FROM access_logs';
  const conditions: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (user_id) {
    conditions.push(`user_id = $${idx++}`);
    values.push(user_id);
  }
  if (event_type) {
    conditions.push(`event_type = $${idx++}`);
    values.push(event_type);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  values.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

  try {
    const result = await pool.query(query, values);
    res.json({ logs: result.rows });
  } catch (err: any) {
    console.error('GetLogs error:', err);
    res.status(500).json({ error: 'Error al obtener logs' });
  }
}
