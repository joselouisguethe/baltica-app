import { useState, useEffect, useCallback, useRef } from 'react';
import { api, getToken } from '@/lib/api';

export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string; // HH:mm format
  streakReminder: boolean;
  encouragement: boolean;
}

export interface AppNotification {
  id: string;
  type: 'reminder' | 'streak' | 'encouragement' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  dailyReminder: true,
  reminderTime: '09:00',
  streakReminder: true,
  encouragement: true,
};

export function useNotifications(userKey?: string) {
  const prefix = userKey ? `${userKey}_` : '';
  const isInitialLoad = useRef(true);

  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem(`${prefix}notificationSettings`);
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${prefix}appNotifications`);
    return saved ? JSON.parse(saved) : [];
  });

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  // Check browser notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Load settings from backend on mount
  useEffect(() => {
    if (getToken()) {
      api.settings.get().then(data => {
        if (data.settings) {
          const s = data.settings;
          setSettings({
            enabled: s.notifications_enabled ?? defaultSettings.enabled,
            dailyReminder: s.daily_reminder ?? defaultSettings.dailyReminder,
            reminderTime: s.reminder_time ?? defaultSettings.reminderTime,
            streakReminder: s.streak_reminder ?? defaultSettings.streakReminder,
            encouragement: s.encouragement ?? defaultSettings.encouragement,
          });
        }
        isInitialLoad.current = false;
      }).catch(() => {
        isInitialLoad.current = false;
      });
    } else {
      isInitialLoad.current = false;
    }
  }, [userKey]);

  // Reload when user changes
  useEffect(() => {
    const savedSettings = localStorage.getItem(`${prefix}notificationSettings`);
    setSettings(savedSettings ? JSON.parse(savedSettings) : defaultSettings);
    const savedNotifications = localStorage.getItem(`${prefix}appNotifications`);
    setNotifications(savedNotifications ? JSON.parse(savedNotifications) : []);
  }, [prefix]);

  // Save settings to localStorage and sync to backend
  useEffect(() => {
    if (prefix || !userKey) localStorage.setItem(`${prefix}notificationSettings`, JSON.stringify(settings));

    // Sync to backend (skip initial load to avoid overwriting backend data)
    if (!isInitialLoad.current && getToken()) {
      api.settings.update({
        notifications_enabled: settings.enabled,
        daily_reminder: settings.dailyReminder,
        reminder_time: settings.reminderTime,
        streak_reminder: settings.streakReminder,
        encouragement: settings.encouragement,
      }).catch(() => { /* fallback to localStorage */ });
    }
  }, [settings, prefix]);

  // Save notifications to localStorage
  useEffect(() => {
    if (prefix || !userKey) localStorage.setItem(`${prefix}appNotifications`, JSON.stringify(notifications));
  }, [notifications, prefix]);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    return permission === 'granted';
  }, []);

  // Send browser push notification
  const sendPushNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permissionStatus === 'granted' && settings.enabled) {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  }, [permissionStatus, settings.enabled]);

  // Add in-app notification
  const addNotification = useCallback((
    type: AppNotification['type'],
    title: string,
    message: string
  ) => {
    const newNotification: AppNotification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    
    // Also send push notification if enabled
    if (settings.enabled) {
      sendPushNotification(title, { body: message });
    }

    return newNotification;
  }, [settings.enabled, sendPushNotification]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Delete single notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    settings,
    updateSettings,
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    requestPermission,
    permissionStatus,
    sendPushNotification,
  };
}
