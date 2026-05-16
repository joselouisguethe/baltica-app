import { Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/db';
import { AuthRequest } from '../types';

function sanitizeUser(row: any) {
  const { password_hash, ...user } = row;
  return user;
}

export async function listUsers(_req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
      `SELECT u.*, jp.current_day, jp.completed_days, jp.streak
       FROM users u
       LEFT JOIN journey_progress jp ON jp.user_id = u.id
       ORDER BY u.created_at DESC`
    );
    const users = result.rows.map(row => ({
      ...sanitizeUser(row),
      current_day: row.current_day ?? 0,
      completed_days: row.completed_days ?? [],
      streak: row.streak ?? 0,
    }));
    res.json({ users });
  } catch (err: any) {
    console.error('ListUsers error:', err);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
}

export async function createUser(req: AuthRequest, res: Response) {
  const { email, name, password, access_duration_days, payment_id, notes } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Email y nombre son requeridos' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Este correo ya está registrado' });
    }

    const settingsRes = await pool.query("SELECT value FROM app_settings WHERE key = 'default_access_days'");
    const defaultDays = parseInt(settingsRes.rows[0]?.value || '60', 10);
    const days = access_duration_days || defaultDays;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const passwordHash = await bcrypt.hash(password || 'baltica2026', 10);

    const result = await pool.query(
      `INSERT INTO users (email, name, password_hash, access_expires_at, access_duration_days, payment_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [email, name, passwordHash, expiresAt.toISOString(), days, payment_id || null, notes || null]
    );

    await pool.query('INSERT INTO journey_progress (user_id) VALUES ($1)', [result.rows[0].id]);

    await pool.query(
      `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
       VALUES ($1, $2, 'account_created', $3)`,
      [result.rows[0].id, email, `Cuenta creada por admin con ${days} días de acceso`]
    );

    res.status(201).json({ user: sanitizeUser(result.rows[0]) });
  } catch (err: any) {
    console.error('CreateUser error:', err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { name, notes, access_duration_days } = req.body;

  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
  if (notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(notes); }
  if (access_duration_days !== undefined) {
    const newExpiry = new Date(Date.now() + access_duration_days * 24 * 60 * 60 * 1000);
    fields.push(`access_duration_days = $${idx++}`); values.push(access_duration_days);
    fields.push(`access_expires_at = $${idx++}`); values.push(newExpiry.toISOString());
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }

  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ user: sanitizeUser(result.rows[0]) });
  } catch (err: any) {
    console.error('UpdateUser error:', err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
}

export async function suspendUser(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET status = 'suspended' WHERE id = $1 RETURNING email`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await pool.query(
      `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
       VALUES ($1, $2, 'access_suspended', $3)`,
      [id, result.rows[0].email, reason || 'Acceso suspendido por administrador']
    );

    res.json({ message: 'Usuario suspendido' });
  } catch (err: any) {
    console.error('SuspendUser error:', err);
    res.status(500).json({ error: 'Error al suspender usuario' });
  }
}

export async function reactivateUser(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { extra_days } = req.body;

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = userRes.rows[0];
    const days = extra_days || user.access_duration_days;
    const newExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await pool.query(
      `UPDATE users SET status = 'active', access_expires_at = $1 WHERE id = $2`,
      [newExpiry.toISOString(), id]
    );

    await pool.query(
      `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
       VALUES ($1, $2, 'access_granted', $3)`,
      [id, user.email, `Acceso reactivado por ${days} días`]
    );

    res.json({ message: 'Usuario reactivado' });
  } catch (err: any) {
    console.error('ReactivateUser error:', err);
    res.status(500).json({ error: 'Error al reactivar usuario' });
  }
}

export async function removeUser(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING email', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (err: any) {
    console.error('RemoveUser error:', err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
}
