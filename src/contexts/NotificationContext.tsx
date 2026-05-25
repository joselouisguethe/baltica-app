import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useNotifications, NotificationSettings, AppNotification } from '@/hooks/useNotifications';
import { useApp } from '@/contexts/AppContext';

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (type: AppNotification['type'], title: string, message: string) => AppNotification;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  deleteNotification: (id: string) => void;
  requestPermission: () => Promise<boolean>;
  permissionStatus: NotificationPermission;
  sendStreakReminder: () => void;
  sendDailyReminder: () => void;
  sendEncouragement: () => void;
  sendAchievement: (milestone: AchievementMilestone) => void;
}

export type AchievementMilestone =
  | 'welcome'
  | 'intro'
  | 'day-1'
  | 'day-2'
  | 'day-3'
  | 'reto-complete';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { t, progress, locale, userEmail } = useApp();
  const {
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
  } = useNotifications(userEmail || undefined);

  // Get localized messages
  const getMessages = () => {
    const isSpanish = locale.startsWith('es');
    return {
      streakTitle: isSpanish ? '🔥 ¡Protege tu racha!' : '🔥 Protect your streak!',
      streakMessage: isSpanish
        ? `Llevas ${progress.streak} días seguidos. ¡No lo pierdas!`
        : `You're on a ${progress.streak} day streak. Don't lose it!`,
      dailyTitle: isSpanish ? '☀️ Es hora de tu práctica' : '☀️ Time for your practice',
      dailyMessage: isSpanish
        ? 'Tu jornada del día te espera. Solo 10 minutos.'
        : "Today's journey awaits you. Just 10 minutes.",
      encouragementTitles: isSpanish
        ? ['💪 ¡Sigue así!', '🌟 Eres increíble', '❤️ Estás haciendo un gran trabajo']
        : ['💪 Keep going!', '🌟 You are amazing', "❤️ You're doing great"],
      encouragementMessages: isSpanish
        ? [
            'Cada pequeño paso cuenta en tu camino.',
            'Tu constancia está construyendo grandes cambios.',
            'Recuerda: el progreso, no la perfección.',
          ]
        : [
            'Every small step counts on your journey.',
            'Your consistency is building great changes.',
            'Remember: progress, not perfection.',
          ],
      milestones: isSpanish
        ? {
            'welcome': {
              title: '🌟 Bienvenida completada',
              message: 'Tu espacio de bienestar ya está listo. Gracias por regalarte este momento.',
            },
            'intro': {
              title: '🧡 Introducción completada',
              message: 'Ya diste el primer paso. A veces, comenzar es lo más importante.',
            },
            'day-1': {
              title: '🧘 Día 1 completado — Atención y calma',
              message: 'Hoy te detuviste para respirar y reconectar contigo.',
            },
            'day-2': {
              title: '🌱 Día 2 completado — Acción con propósito',
              message: 'Cada pequeño paso cuenta. Hoy elegiste avanzar con intención.',
            },
            'day-3': {
              title: '🤩 Día 3 completado — Autocompasión y cierre',
              message: 'Terminaste este reto con amabilidad hacia ti. Gracias por llegar hasta aquí.',
            },
            'reto-complete': {
              title: '🏆 ¡Reto completado!',
              message: 'Tres días, un mismo propósito: cuidarte. Esto puede ser el comienzo de algo muy valioso.',
            },
          }
        : {
            'welcome': {
              title: '🌟 Welcome completed',
              message: 'Your wellbeing space is ready. Thank you for giving yourself this moment.',
            },
            'intro': {
              title: '🧡 Introduction completed',
              message: 'You already took the first step. Sometimes, starting is the most important thing.',
            },
            'day-1': {
              title: '🧘 Day 1 completed — Attention and calm',
              message: 'Today you paused to breathe and reconnect with yourself.',
            },
            'day-2': {
              title: '🌱 Day 2 completed — Purposeful action',
              message: 'Every small step counts. Today you chose to move forward with intention.',
            },
            'day-3': {
              title: '🤩 Day 3 completed — Self-compassion and closing',
              message: 'You finished this challenge with kindness toward yourself. Thank you for making it here.',
            },
            'reto-complete': {
              title: '🏆 Challenge completed!',
              message: 'Three days, one shared purpose: caring for yourself. This could be the start of something very valuable.',
            },
          } as const,
    };
  };

  const sendStreakReminder = () => {
    if (!settings.streakReminder || !settings.enabled) return;
    const messages = getMessages();
    addNotification('streak', messages.streakTitle, messages.streakMessage);
  };

  const sendDailyReminder = () => {
    if (!settings.dailyReminder || !settings.enabled) return;
    const messages = getMessages();
    addNotification('reminder', messages.dailyTitle, messages.dailyMessage);
  };

  const sendEncouragement = () => {
    if (!settings.encouragement || !settings.enabled) return;
    const messages = getMessages();
    const randomIndex = Math.floor(Math.random() * messages.encouragementTitles.length);
    addNotification(
      'encouragement',
      messages.encouragementTitles[randomIndex],
      messages.encouragementMessages[randomIndex]
    );
  };

  const sendAchievement = (milestone: AchievementMilestone) => {
    if (!settings.enabled) return;
    const messages = getMessages();
    const entry = messages.milestones[milestone];
    if (!entry) return;
    addNotification('achievement', entry.title, entry.message);
  };

  // Set up daily reminder scheduler
  useEffect(() => {
    if (!settings.enabled || !settings.dailyReminder) return;

    const prefix = userEmail ? `${userEmail}_` : '';
    const checkAndSendReminder = () => {
      const now = new Date();
      const [hours, minutes] = settings.reminderTime.split(':').map(Number);

      // Check if we already sent a reminder today
      const lastReminderDate = localStorage.getItem(`${prefix}lastDailyReminder`);
      const today = now.toISOString().split('T')[0];

      if (
        now.getHours() === hours &&
        now.getMinutes() === minutes &&
        lastReminderDate !== today
      ) {
        // Check if user hasn't completed today's journey
        const lastCompleted = progress.lastCompletedDate;
        if (lastCompleted !== today) {
          sendDailyReminder();
          localStorage.setItem(`${prefix}lastDailyReminder`, today);
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkAndSendReminder, 60000);
    checkAndSendReminder(); // Check immediately

    return () => clearInterval(interval);
  }, [settings.enabled, settings.dailyReminder, settings.reminderTime, progress.lastCompletedDate, userEmail]);

  // Streak reminder (evening check)
  useEffect(() => {
    if (!settings.enabled || !settings.streakReminder) return;

    const prefix = userEmail ? `${userEmail}_` : '';
    const checkStreakReminder = () => {
      const now = new Date();
      const lastReminderDate = localStorage.getItem(`${prefix}lastStreakReminder`);
      const today = now.toISOString().split('T')[0];

      // Send at 8 PM if user hasn't completed today and has a streak
      if (
        now.getHours() === 20 &&
        lastReminderDate !== today &&
        progress.streak > 0 &&
        progress.lastCompletedDate !== today
      ) {
        sendStreakReminder();
        localStorage.setItem(`${prefix}lastStreakReminder`, today);
      }
    };

    const interval = setInterval(checkStreakReminder, 60000);
    checkStreakReminder();

    return () => clearInterval(interval);
  }, [settings.enabled, settings.streakReminder, progress.streak, progress.lastCompletedDate, userEmail]);

  return (
    <NotificationContext.Provider
      value={{
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
        sendStreakReminder,
        sendDailyReminder,
        sendEncouragement,
        sendAchievement,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
