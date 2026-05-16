import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/baltica',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  PORT: parseInt(process.env.PORT || '3001', 10),
  MERCADOPAGO_WEBHOOK_SECRET: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@baltica.app',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
