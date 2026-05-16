import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Check, Lock, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface DayCardProps {
  day: number;
  status: 'completed' | 'current' | 'locked';
  onClick?: () => void;
}

export function DayCard({ day, status, onClick }: DayCardProps) {
  const { t } = useApp();

  return (
    <motion.button
      onClick={status !== 'locked' ? onClick : undefined}
      disabled={status === 'locked'}
      className={cn(
        'relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300',
        'shadow-card hover:shadow-soft',
        status === 'completed' && 'bg-primary text-primary-foreground',
        status === 'current' && 'bg-card border-2 border-primary',
        status === 'locked' && 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
      )}
      whileHover={status !== 'locked' ? { scale: 1.05 } : {}}
      whileTap={status !== 'locked' ? { scale: 0.98 } : {}}
    >
      {status === 'completed' && (
        <Check className="h-6 w-6" />
      )}
      {status === 'current' && (
        <Play className="h-6 w-6 text-primary" />
      )}
      {status === 'locked' && (
        <Lock className="h-5 w-5" />
      )}
      
      <span className={cn(
        'text-sm font-medium',
        status === 'current' && 'text-primary'
      )}>
        {day === 0 ? 1 : day}
      </span>
      
      {status === 'current' && (
        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
          {t('journey.today')}
        </span>
      )}
    </motion.button>
  );
}
