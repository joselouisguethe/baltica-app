import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';
import { env } from '../config/env';
import bcrypt from 'bcrypt';

async function migrate() {
  const client = await pool.connect();

  try {
    // Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Read migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      // Check if already applied
      const check = await client.query('SELECT name FROM _migrations WHERE name = $1', [file]);
      if (check.rows.length > 0) {
        console.log(`  Skip: ${file} (already applied)`);
        continue;
      }

      console.log(`  Applying: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  Done: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    // Seed admin user if not exists
    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', [env.ADMIN_EMAIL]);
    if (adminCheck.rows.length === 0) {
      const hash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      await client.query(
        `INSERT INTO users (email, name, password_hash, role, access_expires_at, access_duration_days)
         VALUES ($1, 'Administrador', $2, 'admin', $3, 365)`,
        [env.ADMIN_EMAIL, hash, expiresAt.toISOString()]
      );
      console.log(`  Admin user created: ${env.ADMIN_EMAIL}`);
    }

    console.log('Migrations complete.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
