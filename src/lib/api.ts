const API_BASE = '/api';

let authToken: string | null = localStorage.getItem('authToken');

export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

export function getToken() {
  return authToken;
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw { status: res.status, ...data };
  }

  return data;
}

// Auth
export const api = {
  auth: {
    register: (body: { email: string; name: string; password: string }) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/auth/me'),
    updateMe: (body: Record<string, any>) =>
      request('/auth/me', { method: 'PUT', body: JSON.stringify(body) }),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      request('/auth/me/password', { method: 'PUT', body: JSON.stringify(body) }),
  },

  progress: {
    get: () => request('/progress'),
    update: (body: { current_day?: number; current_step?: string }) =>
      request('/progress', { method: 'PUT', body: JSON.stringify(body) }),
    completeDay: (day: number) =>
      request('/progress/complete-day', { method: 'POST', body: JSON.stringify({ day }) }),
  },

  answers: {
    getAll: () => request('/answers'),
    save: (dayKey: string, answers: Record<string, any>) =>
      request(`/answers/${dayKey}`, { method: 'PUT', body: JSON.stringify({ answers }) }),
  },

  // User settings (notifications, preferences)
  settings: {
    get: () => request('/settings'),
    update: (settings: {
      locale?: string;
      theme?: string;
      notifications_enabled?: boolean;
      daily_reminder?: boolean;
      reminder_time?: string;
      streak_reminder?: boolean;
      encouragement?: boolean;
    }) => request('/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  },

  diplomas: {
    get: () => request('/diplomas'),
    issue: () => request('/diplomas', { method: 'POST' }),
  },

  surveys: {
    get: () => request('/surveys'),
    submit: (body: { first_name: string; last_name: string; phone: string; email: string; contact_authorized: boolean; responses?: Record<string, any> }) =>
      request('/surveys', { method: 'POST', body: JSON.stringify(body) }),
  },

  payments: {
    createPreference: (planType?: string) =>
      request('/payments/create-preference', { method: 'POST', body: JSON.stringify({ plan_type: planType || 'basico' }) }),
    verifyPayment: (paymentId: string) =>
      request(`/payments/verify/${paymentId}`),
  },

  admin: {
    users: {
      list: () => request('/admin/users'),
      create: (body: Record<string, any>) =>
        request('/admin/users', { method: 'POST', body: JSON.stringify(body) }),
      update: (id: string, body: Record<string, any>) =>
        request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
      suspend: (id: string, reason?: string) =>
        request(`/admin/users/${id}/suspend`, { method: 'PUT', body: JSON.stringify({ reason }) }),
      reactivate: (id: string, extraDays?: number) =>
        request(`/admin/users/${id}/reactivate`, { method: 'PUT', body: JSON.stringify({ extra_days: extraDays }) }),
      remove: (id: string) =>
        request(`/admin/users/${id}`, { method: 'DELETE' }),
    },
    logs: {
      get: (params?: { user_id?: string; event_type?: string; limit?: number; offset?: number }) => {
        const searchParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined) searchParams.set(k, String(v));
          });
        }
        const qs = searchParams.toString();
        return request(`/admin/logs${qs ? '?' + qs : ''}`);
      },
    },
    settings: {
      get: () => request('/admin/settings'),
      update: (key: string, value: string) =>
        request('/admin/settings', { method: 'PUT', body: JSON.stringify({ key, value }) }),
    },
    surveys: {
      getAll: () => request('/surveys/all'),
    },
  },
};
