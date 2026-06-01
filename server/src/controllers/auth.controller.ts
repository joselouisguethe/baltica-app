import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { env } from '../config/env';
import { AuthRequest } from '../types';

function createToken(userId: string, email: string, role: string) {
  return jwt.sign({ userId, email, role }, env.JWT_SECRET, { expiresIn: '7d' });
}

function sanitizeUser(row: any) {
  const { password_hash, ...user } = row;
  return user;
}

export async function register(req: Request, res: Response) {
  const { email, name, password } = req.body;
  // Attribution from the landing page. acquisition_source is guarded: a public
  // signup can only ever be 'direct'. 'hotmart' is assigned exclusively by the
  // verified Hotmart webhook, and 'admin' only by admin-created users — so the
  // channel buckets cannot be spoofed from the client. See dual-channel plan.
  const acquisitionSource = 'direct';
  const utmSource = typeof req.body?.utm_source === 'string' ? req.body.utm_source.slice(0, 100) : null;
  const utmMedium = typeof req.body?.utm_medium === 'string' ? req.body.utm_medium.slice(0, 100) : null;
  const utmCampaign = typeof req.body?.utm_campaign === 'string' ? req.body.utm_campaign.slice(0, 100) : null;
  const landingReferrer = typeof req.body?.landing_referrer === 'string' ? req.body.landing_referrer.slice(0, 2000) : null;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  try {
    // Check if email exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Este correo ya está registrado' });
    }

    // Get default access days
    const settingsRes = await pool.query("SELECT value FROM app_settings WHERE key = 'default_access_days'");
    const accessDays = parseInt(settingsRes.rows[0]?.value || '60', 10);

    const passwordHash = await bcrypt.hash(password, 10);
    const expiresAt = new Date(Date.now() + accessDays * 24 * 60 * 60 * 1000);

    const result = await pool.query(
      `INSERT INTO users (email, name, password_hash, status, access_expires_at, access_duration_days,
                          acquisition_source, utm_source, utm_medium, utm_campaign, landing_referrer)
       VALUES ($1, $2, $3, 'suspended', $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [email, name, passwordHash, expiresAt.toISOString(), accessDays,
       acquisitionSource, utmSource, utmMedium, utmCampaign, landingReferrer]
    );

    const user = result.rows[0];

    // Create initial progress
    await pool.query(
      `INSERT INTO journey_progress (user_id) VALUES ($1)`,
      [user.id]
    );

    // Log
    await pool.query(
      `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
       VALUES ($1, $2, 'account_created', 'Cuenta creada')`,
      [user.id, email]
    );

    const token = createToken(user.id, user.email, user.role);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error al crear cuenta' });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Check expiration and update status (but still allow login)
    if (user.status !== 'suspended' && new Date(user.access_expires_at) < new Date()) {
      await pool.query("UPDATE users SET status = 'expired' WHERE id = $1", [user.id]);
      user.status = 'expired';
    }

    // Update last login
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // Log
    await pool.query(
      `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
       VALUES ($1, $2, 'login', 'Inicio de sesión')`,
      [user.id, email]
    );

    const token = createToken(user.id, user.email, user.role);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user!.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ user: sanitizeUser(result.rows[0]) });
  } catch (err: any) {
    console.error('GetMe error:', err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
}

export async function updateMe(req: AuthRequest, res: Response) {
  const { name, locale, theme, onboarding_completed, preferred_reminder_time } = req.body;
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
  if (locale !== undefined) { fields.push(`locale = $${idx++}`); values.push(locale); }
  if (theme !== undefined) { fields.push(`theme = $${idx++}`); values.push(theme); }
  if (onboarding_completed !== undefined) { fields.push(`onboarding_completed = $${idx++}`); values.push(onboarding_completed); }
  if (preferred_reminder_time !== undefined) { fields.push(`preferred_reminder_time = $${idx++}`); values.push(preferred_reminder_time); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }

  values.push(req.user!.userId);

  try {
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    res.json({ user: sanitizeUser(result.rows[0]) });
  } catch (err: any) {
    console.error('UpdateMe error:', err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Contraseña inválida' });
  }

  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user!.userId]);
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user!.userId]);
    res.json({ message: 'Contraseña actualizada' });
  } catch (err: any) {
    console.error('ChangePassword error:', err);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
}

// Claim an account created by an external purchase (e.g. Hotmart webhook).
// The user exists with must_set_password=TRUE and no usable password; here they
// set their password using the email they purchased with — no SMTP required.
// Returns a generic error whether or not the email is claimable, to avoid
// account enumeration.
export async function claimAccount(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Email y una contraseña de al menos 8 caracteres son requeridos' });
  }

  const genericError = 'No encontramos una compra pendiente de activar con ese correo. Verifica el correo que usaste al comprar.';

  try {
    const result = await pool.query(
      'SELECT id, email, must_set_password FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    if (!user || !user.must_set_password) {
      return res.status(400).json({ error: genericError });
    }

    const hash = await bcrypt.hash(password, 10);
    const updated = await pool.query(
      `UPDATE users SET password_hash = $1, must_set_password = FALSE WHERE id = $2 RETURNING *`,
      [hash, user.id]
    );
    const fullUser = updated.rows[0];

    await pool.query(
      `INSERT INTO access_logs (user_id, user_email, event_type, event_detail)
       VALUES ($1, $2, 'account_claimed', 'Cuenta activada por el comprador (claim)')`,
      [fullUser.id, fullUser.email]
    );

    const token = createToken(fullUser.id, fullUser.email, fullUser.role);
    res.json({ token, user: sanitizeUser(fullUser) });
  } catch (err: any) {
    console.error('ClaimAccount error:', err);
    res.status(500).json({ error: 'Error al activar la cuenta' });
  }
}
