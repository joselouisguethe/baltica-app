import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'expired';
  access_expires_at: string;
  access_duration_days: number;
  payment_id: string | null;
  notes: string | null;
  locale: string;
  theme: string;
  onboarding_completed: boolean;
  preferred_reminder_time: string;
  // Notification settings
  notifications_enabled: boolean;
  daily_reminder: boolean;
  reminder_time: string;
  streak_reminder: boolean;
  encouragement: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface ProgressRow {
  id: string;
  user_id: string;
  current_day: number;
  completed_days: number[];
  current_step: string;
  streak: number;
  last_completed_date: string | null;
}

export interface DayAnswerRow {
  id: string;
  user_id: string;
  day_key: string;
  answers: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AccessLogRow {
  id: string;
  user_id: string | null;
  user_email: string;
  event_type: string;
  event_detail: string;
  created_at: string;
}
