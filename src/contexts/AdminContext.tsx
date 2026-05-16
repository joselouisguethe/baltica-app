import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'suspended' | 'expired';
  registeredAt: string;
  accessExpiresAt: string;
  accessDurationDays: number;
  completedDays: number[];
  currentDay: number;
  streak: number;
  lastLogin?: string;
  paymentId?: string;
  notes?: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  eventType: string;
  eventDetail: string;
}

interface AdminContextType {
  isAdmin: boolean;
  users: ManagedUser[];
  accessLogs: AccessLog[];
  addUser: (user: { email: string; name: string; status?: string; accessDurationDays?: number; paymentId?: string; notes?: string; password?: string }) => void;
  suspendUser: (userId: string, reason?: string) => void;
  reactivateUser: (userId: string, extraDays?: number) => void;
  updateAccessDuration: (userId: string, days: number) => void;
  removeUser: (userId: string) => void;
  getUserStatus: (email: string) => ManagedUser | undefined;
  addLog: (log: Omit<AccessLog, 'id' | 'timestamp'>) => void;
  defaultAccessDays: number;
  setDefaultAccessDays: (days: number) => void;
  refreshUsers: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Map API user row to ManagedUser
function mapUser(row: any): ManagedUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    status: row.status,
    registeredAt: row.created_at,
    accessExpiresAt: row.access_expires_at,
    accessDurationDays: row.access_duration_days || 60,
    completedDays: row.completed_days || [],
    currentDay: row.current_day || 0,
    streak: row.streak || 0,
    lastLogin: row.last_login_at,
    paymentId: row.payment_id,
    notes: row.notes,
  };
}

function mapLog(row: any): AccessLog {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    timestamp: row.created_at,
    eventType: row.event_type,
    eventDetail: row.event_detail,
  };
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<ManagedUser[]>(() => {
    const saved = localStorage.getItem('admin_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(() => {
    const saved = localStorage.getItem('admin_accessLogs');
    return saved ? JSON.parse(saved) : [];
  });

  const [defaultAccessDays, setDefaultAccessDaysState] = useState(() => {
    return parseInt(localStorage.getItem('admin_defaultAccessDays') || '60', 10);
  });

  const { userRole } = useApp();
  const isAdmin = userRole === 'admin';

  // Sync localStorage
  useEffect(() => { localStorage.setItem('admin_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('admin_accessLogs', JSON.stringify(accessLogs)); }, [accessLogs]);
  useEffect(() => { localStorage.setItem('admin_defaultAccessDays', String(defaultAccessDays)); }, [defaultAccessDays]);

  const refreshUsers = useCallback(() => {
    if (!isAdmin || !getToken()) return;
    api.admin.users.list().then(data => {
      if (data.users) setUsers(data.users.map(mapUser));
    }).catch(() => {});
    api.admin.logs.get({ limit: 200 }).then(data => {
      if (data.logs) setAccessLogs(data.logs.map(mapLog));
    }).catch(() => {});
    api.admin.settings.get().then(data => {
      if (data.settings?.default_access_days) {
        setDefaultAccessDaysState(parseInt(data.settings.default_access_days, 10));
      }
    }).catch(() => {});
  }, [isAdmin]);

  // Load from API on mount
  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // Check for expired users locally
  useEffect(() => {
    const now = new Date();
    setUsers(prev => prev.map(u => {
      if (u.status === 'active' && new Date(u.accessExpiresAt) < now) {
        return { ...u, status: 'expired' as const };
      }
      return u;
    }));
  }, []);

  const addLog = (log: Omit<AccessLog, 'id' | 'timestamp'>) => {
    const newLog: AccessLog = {
      ...log,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    setAccessLogs(prev => [newLog, ...prev]);
  };

  const addUser = (userData: { email: string; name: string; status?: string; accessDurationDays?: number; paymentId?: string; notes?: string; password?: string }) => {
    // Try API first
    api.admin.users.create({
      email: userData.email,
      name: userData.name,
      access_duration_days: userData.accessDurationDays || defaultAccessDays,
      payment_id: userData.paymentId,
      notes: userData.notes,
      password: userData.password,
    }).then(data => {
      if (data.user) {
        setUsers(prev => [...prev, mapUser(data.user)]);
      }
    }).catch(() => {
      // Fallback: add locally
      const now = new Date();
      const days = userData.accessDurationDays || defaultAccessDays;
      const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      const newUser: ManagedUser = {
        id: generateId(),
        email: userData.email,
        name: userData.name,
        status: 'active',
        registeredAt: now.toISOString(),
        accessExpiresAt: expiresAt.toISOString(),
        accessDurationDays: days,
        completedDays: [],
        currentDay: 0,
        streak: 0,
        paymentId: userData.paymentId,
        notes: userData.notes,
      };
      setUsers(prev => [...prev, newUser]);
      addLog({
        userId: newUser.id,
        userEmail: newUser.email,
        eventType: 'account_created',
        eventDetail: `account_created:${days}`,
      });
    });
  };

  const suspendUser = (userId: string, reason?: string) => {
    api.admin.users.suspend(userId, reason).catch(() => {});
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, status: 'suspended' as const } : u
    ));
    const user = users.find(u => u.id === userId);
    if (user) {
      addLog({
        userId,
        userEmail: user.email,
        eventType: 'access_suspended',
        eventDetail: reason || 'access_suspended',
      });
    }
  };

  const reactivateUser = (userId: string, extraDays?: number) => {
    api.admin.users.reactivate(userId, extraDays).catch(() => {});
    const now = new Date();
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const days = extraDays || u.accessDurationDays;
      const newExpiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      return { ...u, status: 'active' as const, accessExpiresAt: newExpiry.toISOString() };
    }));
    const user = users.find(u => u.id === userId);
    if (user) {
      addLog({
        userId,
        userEmail: user.email,
        eventType: 'access_granted',
        eventDetail: `access_granted:${extraDays || user.accessDurationDays}`,
      });
    }
  };

  const updateAccessDuration = (userId: string, days: number) => {
    const safeDays = Math.max(1, days);
    api.admin.users.update(userId, { access_duration_days: safeDays }).catch(() => {});
    const now = new Date();
    const newExpiry = new Date(now.getTime() + safeDays * 24 * 60 * 60 * 1000);
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, accessDurationDays: safeDays, accessExpiresAt: newExpiry.toISOString(), status: 'active' } : u
    ));
  };

  const removeUser = (userId: string) => {
    api.admin.users.remove(userId).catch(() => {});
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const getUserStatus = (email: string) => {
    return users.find(u => u.email === email);
  };

  const setDefaultAccessDays = (days: number) => {
    setDefaultAccessDaysState(days);
    api.admin.settings.update('default_access_days', String(days)).catch(() => {});
  };

  return (
    <AdminContext.Provider value={{
      isAdmin,
      users,
      accessLogs,
      addUser,
      suspendUser,
      reactivateUser,
      updateAccessDuration,
      removeUser,
      getUserStatus,
      addLog,
      defaultAccessDays,
      setDefaultAccessDays,
      refreshUsers,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
