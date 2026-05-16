import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, getTranslation, TranslationKey } from '@/lib/i18n';
import { api, setToken, getToken } from '@/lib/api';

interface JourneyProgress {
  currentDay: number;
  completedDays: number[];
  currentStep: 'start' | 'video' | 'audio' | 'download' | 'survey' | 'closure';
  day0Step: number;
  streak: number;
  lastCompletedDate: string | null;
}

// Day answers per the pedagogical spec
export interface WelcomeAnswers {
  mood: string;                              // kept for backward compat (= moodBefore)
  energy?: 'high' | 'medium' | 'low';       // kept for backward compat (= energyBefore)
  moodBefore?: string;
  energyBefore?: 'high' | 'medium' | 'low';
  moodAfter?: string;
  energyAfter?: 'high' | 'medium' | 'low';
  ethicalNoteViewed: boolean;
  welcomeVideoWatched?: boolean;
  introVideoWatched?: boolean;
  completedAt?: string;
}

export interface Day1Answers {
  words: [string, string, string];
  action?: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  videoWatched: boolean;
  audioCompleted: boolean;
  completedAt?: string;
}

export interface Day2Answers {
  value: string;
  customValue?: string;
  action: string;
  timeSlot: string;
  wordsAfter: [string, string, string];
  videoWatched: boolean;
  audioCompleted: boolean;
  completedAt?: string;
}

export interface Day3Answers {
  mood: string;
  energy?: 'high' | 'medium' | 'low';
  gratitudes: [string, string, string];
  kindPhrase: string;
  nextAction: string;
  videoWatched: boolean;
  audioCompleted: boolean;
  completedAt?: string;
}

export interface DayAnswers {
  welcome?: WelcomeAnswers;
  day1?: Day1Answers;
  day2?: Day2Answers;
  day3?: Day3Answers;
}

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  userEmail: string;
  userRole: 'user' | 'admin';
  login: (email: string, password: string, name?: string, isRegister?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Locale
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Journey
  progress: JourneyProgress;
  setCurrentDay: (day: number) => void;
  setCurrentStep: (step: JourneyProgress['currentStep']) => void;
  setDay0Step: (step: number) => void;
  completeDay: (day: number) => void;
  totalDays: number;

  // Day Answers
  dayAnswers: DayAnswers;
  saveDayAnswers: (answers: Partial<DayAnswers>) => void;

  // User
  userName: string;
  setUserName: (name: string) => void;

  // Onboarding
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  preferredReminderTime: string;
  setPreferredReminderTime: (time: string) => void;

  // Payment
  paymentCompleted: boolean;
  setPaymentCompleted: (completed: boolean) => void;

  // Plan
  planType: string;
  setPlanType: (plan: string) => void;
}

const defaultProgress: JourneyProgress = {
  currentDay: 0,
  completedDays: [],
  currentStep: 'start',
  day0Step: 0,
  streak: 0,
  lastCompletedDate: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('userEmail') || '';
  });

  const [userRole, setUserRole] = useState<'user' | 'admin'>(() => {
    return (localStorage.getItem('userRole') as 'user' | 'admin') || 'user';
  });

  // MVP: Fixed to Spanish (Latin America) only
  const [locale, setLocale] = useState<Locale>('es-LATAM');

  // Sync HTML lang attribute with current locale
  useEffect(() => {
    const langMap: Record<Locale, string> = { 'es-ES': 'es', 'es-LATAM': 'es', 'en': 'en' };
    document.documentElement.lang = langMap[locale] || 'es';
  }, [locale]);

  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  });

  // Helper to get per-user localStorage key
  const userPrefix = (key: string, email?: string) => {
    const e = email || userEmail;
    return e ? `${e}_${key}` : key;
  };

  const [progress, setProgress] = useState<JourneyProgress>(() => {
    const saved = localStorage.getItem(userPrefix('journeyProgress'));
    return saved ? { ...defaultProgress, ...JSON.parse(saved) } : defaultProgress;
  });

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || '';
  });

  const [dayAnswers, setDayAnswers] = useState<DayAnswers>(() => {
    const saved = localStorage.getItem(userPrefix('dayAnswers'));
    return saved ? JSON.parse(saved) : {};
  });

  const [onboardingCompleted, setOnboardingCompletedState] = useState(() => {
    return localStorage.getItem(userPrefix('onboardingCompleted')) === 'true';
  });

  const [preferredReminderTime, setPreferredReminderTimeState] = useState(() => {
    return localStorage.getItem(userPrefix('preferredReminderTime')) || '08:00';
  });

  const [paymentCompleted, setPaymentCompletedState] = useState(() => {
    return localStorage.getItem(userPrefix('paymentCompleted')) === 'true';
  });

  const [planType, setPlanTypeState] = useState(() => {
    return localStorage.getItem(userPrefix('planType')) || 'basico';
  });

  const totalDays = 3; // MVP: Bienvenida (0) + 3 días

  // Reload per-user data when userEmail changes (login/logout)
  useEffect(() => {
    const savedProgress = localStorage.getItem(userPrefix('journeyProgress'));
    setProgress(savedProgress ? JSON.parse(savedProgress) : defaultProgress);
    const savedAnswers = localStorage.getItem(userPrefix('dayAnswers'));
    setDayAnswers(savedAnswers ? JSON.parse(savedAnswers) : {});
    setOnboardingCompletedState(localStorage.getItem(userPrefix('onboardingCompleted')) === 'true');
    setPreferredReminderTimeState(localStorage.getItem(userPrefix('preferredReminderTime')) || '08:00');
    setPaymentCompletedState(localStorage.getItem(userPrefix('paymentCompleted')) === 'true');
    setPlanTypeState(localStorage.getItem(userPrefix('planType')) || 'basico');
  }, [userEmail]);

  // Load data from API on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && getToken()) {
      // Load progress from API
      api.progress.get().then(data => {
        if (data.progress) {
          const p = data.progress;
          setProgress(prev => ({
            ...prev,
            currentDay: p.current_day,
            completedDays: p.completed_days || [],
            // Prefer local step if API returns 'start' but local has a more advanced step
            currentStep: (p.current_step && p.current_step !== 'start') ? p.current_step : prev.currentStep,
            streak: p.streak || 0,
            lastCompletedDate: p.last_completed_date || null,
          }));
        }
      }).catch(() => { /* use local state */ });

      // Load answers from API
      api.answers.getAll().then(data => {
        if (data.answers) {
          setDayAnswers(data.answers);
        }
      }).catch(() => { /* use local state */ });

      // Load user settings (locale, theme) from API
      api.settings.get().then(data => {
        if (data.settings) {
          if (data.settings.locale && ['es-ES', 'es-LATAM', 'en'].includes(data.settings.locale)) {
            setLocale(data.settings.locale as Locale);
          }
          if (data.settings.theme && ['light', 'dark', 'system'].includes(data.settings.theme)) {
            setThemeState(data.settings.theme as 'light' | 'dark' | 'system');
          }
        }
      }).catch(() => { /* use local state */ });
    }
  }, [isAuthenticated]);

  const login = async (email: string, password: string, name?: string, isRegister?: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      let data: any;
      if (isRegister && name) {
        data = await api.auth.register({ email, name, password });
      } else {
        data = await api.auth.login({ email, password });
      }

      setToken(data.token);
      setIsAuthenticated(true);
      setUserEmail(data.user.email);
      setUserName(data.user.name);
      setUserRole(data.user.role);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userRole', data.user.role);

      if (data.user.locale) setLocale(data.user.locale);
      if (data.user.onboarding_completed) setOnboardingCompletedState(true);

      // Sync payment status from backend - active status means paid
      const isPaid = data.user.status === 'active';
      setPaymentCompletedState(isPaid);
      localStorage.setItem(userPrefix('paymentCompleted', data.user.email), String(isPaid));

      // Sync plan type
      if (data.user.plan_type) {
        setPlanTypeState(data.user.plan_type);
        localStorage.setItem(userPrefix('planType', data.user.email), data.user.plan_type);
      }

      return { success: true };
    } catch (err: any) {
      // Fallback to local mock if API is unavailable
      if (err instanceof TypeError && err.message.includes('fetch')) {
        // Network error - API not running, use local mock
        setIsAuthenticated(true);
        setUserEmail(email);
        setUserName(name || email.split('@')[0]);
        setUserRole(email === 'admin@baltica.app' ? 'admin' : 'user');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name || email.split('@')[0]);
        localStorage.setItem('userRole', email === 'admin@baltica.app' ? 'admin' : 'user');
        return { success: true };
      }
      return { success: false, error: err.error || 'Error de autenticación' };
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    setUserEmail('');
    setUserRole('user');
    localStorage.setItem('isAuthenticated', 'false');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    setPaymentCompletedState(false);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
    // Sync theme to backend
    if (isAuthenticated && getToken()) {
      api.settings.update({ theme }).catch(() => {});
    }
  }, [theme, isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('locale', locale);
    // Sync locale to backend
    if (isAuthenticated && getToken()) {
      api.settings.update({ locale }).catch(() => {});
    }
  }, [locale, isAuthenticated]);
  useEffect(() => { localStorage.setItem(userPrefix('journeyProgress'), JSON.stringify(progress)); }, [progress, userEmail]);
  useEffect(() => { localStorage.setItem('userName', userName); }, [userName]);
  useEffect(() => { localStorage.setItem(userPrefix('dayAnswers'), JSON.stringify(dayAnswers)); }, [dayAnswers, userEmail]);

  const t = (key: TranslationKey): string => getTranslation(locale, key);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
  };

  const setCurrentDay = (day: number) => {
    setProgress(prev => ({ ...prev, currentDay: day }));
    api.progress.update({ current_day: day }).catch(() => {});
  };

  const setCurrentStep = (step: JourneyProgress['currentStep']) => {
    setProgress(prev => ({ ...prev, currentStep: step }));
    api.progress.update({ current_step: step }).catch(() => {});
  };

  const setDay0Step = (step: number) => {
    setProgress(prev => ({ ...prev, day0Step: step }));
  };

  const completeDay = (day: number) => {
    const today = new Date().toISOString().split('T')[0];
    setProgress(prev => {
      let newCompletedDays = [...prev.completedDays];
      if (!newCompletedDays.includes(day)) {
        newCompletedDays.push(day);
      }
      // Day 0 completion auto-completes day 1 (merged into Día 1)
      if (day === 0 && !newCompletedDays.includes(1)) {
        newCompletedDays.push(1);
      }

      let newStreak = prev.streak;
      if (prev.lastCompletedDate) {
        const lastDate = new Date(prev.lastCompletedDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak = prev.streak + 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // When day 0 completes, skip to day 2 (day 1 is part of day 0 now)
      const nextDay = day === 0 ? 2 : Math.min(day + 1, totalDays);

      return {
        ...prev,
        completedDays: newCompletedDays,
        currentDay: nextDay,
        currentStep: 'start',
        day0Step: 0,
        streak: newStreak,
        lastCompletedDate: today,
      };
    });
    // Sync to API
    api.progress.completeDay(day).catch(() => {});
  };

  const saveDayAnswers = (answers: Partial<DayAnswers>) => {
    setDayAnswers(prev => ({ ...prev, ...answers }));
    // Sync each key to API
    Object.entries(answers).forEach(([key, value]) => {
      if (value) {
        api.answers.save(key, value).catch(() => {});
      }
    });
  };

  const setOnboardingCompleted = (completed: boolean) => {
    setOnboardingCompletedState(completed);
    localStorage.setItem(userPrefix('onboardingCompleted'), String(completed));
    api.auth.updateMe({ onboarding_completed: completed }).catch(() => {});
  };

  const setPreferredReminderTime = (time: string) => {
    setPreferredReminderTimeState(time);
    localStorage.setItem(userPrefix('preferredReminderTime'), time);
    api.auth.updateMe({ preferred_reminder_time: time }).catch(() => {});
  };

  const setPaymentCompleted = (completed: boolean) => {
    setPaymentCompletedState(completed);
    localStorage.setItem(userPrefix('paymentCompleted'), String(completed));
  };

  const setPlanType = (plan: string) => {
    setPlanTypeState(plan);
    localStorage.setItem(userPrefix('planType'), plan);
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      userEmail,
      userRole,
      login,
      logout,
      locale,
      setLocale,
      t,
      theme,
      setTheme,
      progress,
      setCurrentDay,
      setCurrentStep,
      setDay0Step,
      completeDay,
      totalDays,
      dayAnswers,
      saveDayAnswers,
      userName,
      setUserName,
      onboardingCompleted,
      setOnboardingCompleted,
      preferredReminderTime,
      setPreferredReminderTime,
      paymentCompleted,
      setPaymentCompleted,
      planType,
      setPlanType,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
