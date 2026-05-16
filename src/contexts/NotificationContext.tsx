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
  sendAchievement: (day: number) => void;
}

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
      achievementTitle: isSpanish ? '🏆 ¡Día completado!' : '🏆 Day completed!',
      achievementMessage: (day: number) =>
        isSpanish
          ? `Has completado el día ${day}. ¡Excelente trabajo!`
          : `You completed day ${day}. Excellent work!`,
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

  const sendAchievement = (day: number) => {
    if (!settings.enabled) return;
    const messages = getMessages();
    addNotification('achievement', messages.achievementTitle, messages.achievementMessage(day));
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
