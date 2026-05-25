import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Star, Sparkles, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Confetti } from './Confetti';
import { useApp } from '@/contexts/AppContext';

export type CelebrationType = 
  | 'day-complete' 
  | 'streak-3' 
  | 'streak-7' 
  | 'streak-14' 
  | 'streak-21' 
  | 'halfway' 
  | 'journey-complete';

interface CelebrationModalProps {
  type: CelebrationType;
  isOpen: boolean;
  onClose: () => void;
  streakCount?: number;
  dayNumber?: number;
}

const celebrationConfig: Record<CelebrationType, {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  confettiCount: number;
}> = {
  'day-complete': {
    icon: Star,
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    confettiCount: 30,
  },
  'streak-3': {
    icon: Flame,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    confettiCount: 40,
  },
  'streak-7': {
    icon: Flame,
    iconColor: 'text-orange-500',
    iconBg: 'bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30',
    confettiCount: 60,
  },
  'streak-14': {
    icon: Trophy,
    iconColor: 'text-amber-500',
    iconBg: 'bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30',
    confettiCount: 80,
  },
  'streak-21': {
    icon: Trophy,
    iconColor: 'text-primary',
    iconBg: 'bg-gradient-to-br from-primary/20 to-secondary/20',
    confettiCount: 100,
  },
  'halfway': {
    icon: Heart,
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-100 dark:bg-pink-900/30',
    confettiCount: 50,
  },
  'journey-complete': {
    icon: Sparkles,
    iconColor: 'text-primary',
    iconBg: 'bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20',
    confettiCount: 150,
  },
};

export function CelebrationModal({ 
  type, 
  isOpen, 
  onClose, 
  streakCount = 0,
  dayNumber = 0,
}: CelebrationModalProps) {
  const { t, locale } = useApp();
  const [showConfetti, setShowConfetti] = useState(false);
  const config = celebrationConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timeout = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const getMessage = () => {
    const isSpanish = locale.startsWith('es');

    switch (type) {
      case 'day-complete':
        if (dayNumber === 1 || dayNumber === 0) {
          return {
            title: isSpanish ? 'Reto Completado' : 'Challenge Completed',
            subtitle: isSpanish
              ? 'Este es solo el primer gesto de un nuevo camino hacia tu bienestar.'
              : 'This is just the first gesture of a new path toward your wellbeing.',
          };
        }
        if (dayNumber === 2) {
          return {
            title: isSpanish ? '¡Día 2 superado!' : 'Day 2 conquered!',
            subtitle: isSpanish
              ? 'Estás cultivando el hábito de escucharte. Cada pausa consciente cuenta y fortalece tu bienestar.'
              : 'You are cultivating the habit of listening to yourself. Each conscious pause counts and strengthens your wellbeing.',
          };
        }
        return {
          title: isSpanish ? '¡Viaje de 3 días completado!' : '3-day trip completed!',
          subtitle: isSpanish ? `Has honrado tu acuerdo contigo mismo. Recuerda que este bienestar te pertenece y puedes volver a él siempre que lo necesites.` : `You have honored your agreement with yourself. Remember that this well-being belongs to you and you can return to it whenever you need to.`,
        };
      case 'streak-3':
        return {
          title: isSpanish ? '🔥 ¡3 días seguidos!' : '🔥 3 days in a row!',
          subtitle: isSpanish
            ? 'Estás creando un hábito. ¡No pares ahora!'
            : "You're building a habit. Don't stop now!",
        };
      case 'streak-7':
        return {
          title: isSpanish ? '🔥 ¡Una semana completa!' : '🔥 One full week!',
          subtitle: isSpanish
            ? '7 días de constancia. ¡Eres increíble!'
            : '7 days of consistency. You are amazing!',
        };
      case 'streak-14':
        return {
          title: isSpanish ? '🏆 ¡Dos semanas!' : '🏆 Two weeks!',
          subtitle: isSpanish
            ? '14 días creando cambio real. ¡Impresionante!'
            : '14 days creating real change. Impressive!',
        };
      case 'streak-21':
        return {
          title: isSpanish ? '🏆 ¡Hábito formado!' : '🏆 Habit formed!',
          subtitle: isSpanish
            ? '21 días. Dicen que este es el número mágico. ¡Lo lograste!'
            : '21 days. They say this is the magic number. You did it!',
        };
      case 'halfway':
        return {
          title: isSpanish ? '💪 ¡A mitad del camino!' : '💪 Halfway there!',
          subtitle: isSpanish
            ? 'Has completado la mitad del viaje. El cambio ya está sucediendo.'
            : 'You completed half the journey. Change is already happening.',
        };
      case 'journey-complete':
        return {
          title: isSpanish ? '✨ ¡Viaje de 3 días completado!' : '✨ 3-day journey complete!',
          subtitle: isSpanish
            ? 'Has honrado tu acuerdo contigo mismo. Recuerda que este bienestar te pertenece y puedes volver a él siempre que lo necesites.'
            : 'You honored your agreement with yourself. Remember this wellbeing belongs to you and you can return to it whenever you need.',
        };
      default:
        return { title: '', subtitle: '' };
    }
  };

  const message = getMessage();

  return (
    <>
      <Confetti isActive={showConfetti} pieceCount={config.confettiCount} />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative bg-card border border-border rounded-2xl shadow-xl max-w-sm w-full p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2, damping: 10 }}
                className={`${
                  type === 'journey-complete'
                    ? 'w-40 h-40 ring-4 ring-primary/30 shadow-2xl shadow-primary/30'
                    : 'w-24 h-24'
                } rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-6`}
              >
                <Icon
                  className={`${
                    type === 'journey-complete' ? 'h-24 w-24' : 'h-12 w-12'
                  } ${config.iconColor}`}
                />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                {message.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-6"
              >
                {message.subtitle}
              </motion.p>

              {streakCount > 0 && type.startsWith('streak') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-2 mb-6"
                >
                  <Flame className="h-6 w-6 text-orange-500" />
                  <span className="text-3xl font-bold text-foreground">{streakCount}</span>
                  <span className="text-muted-foreground">
                    {locale.startsWith('es') ? 'días' : 'days'}
                  </span>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button onClick={onClose} className="rounded-full px-8 bg-[#10B0C0] hover:bg-[#0e9aaa] text-white">
                  {locale.startsWith('es') ? 'Hecho con amor' : 'Made with love'}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
