import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// PDF specifies 3 options (1/2/3 style) with friendly tone, no clinical labels
export type Mood = 'good' | 'okay' | 'difficult';

interface MoodSelectorProps {
  onSelect: (mood: Mood) => void;
  selectedMood?: Mood | string;
  showResponse?: boolean;
}

// 3 options per PDF specification with empathetic responses
const moods: { key: Mood; emoji: string; color: string }[] = [
  { key: 'good', emoji: '😊', color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' },
  { key: 'okay', emoji: '😐', color: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700' },
  { key: 'difficult', emoji: '😔', color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700' },
];

export function MoodSelector({ onSelect, selectedMood, showResponse = true }: MoodSelectorProps) {
  const { t } = useApp();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm mx-auto">
        {moods.map((mood, index) => (
          <motion.button
            key={mood.key}
            onClick={() => !selectedMood && onSelect(mood.key)}
            disabled={!!selectedMood}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
              mood.color,
              selectedMood === mood.key && 'ring-2 ring-primary ring-offset-2',
              selectedMood && selectedMood !== mood.key && 'opacity-40 pointer-events-none'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={!selectedMood ? { scale: 1.05 } : {}}
            whileTap={!selectedMood ? { scale: 0.95 } : {}}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span className="text-sm font-medium text-foreground">
              {t(`mood.${mood.key}` as any)}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Empathetic response after selection (per PDF spec) */}
      <AnimatePresence>
        {showResponse && selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center p-4 rounded-xl bg-accent/20 border border-accent/30"
          >
            <p className="text-sm text-foreground">
              {t(`mood.response.${selectedMood}` as any)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
