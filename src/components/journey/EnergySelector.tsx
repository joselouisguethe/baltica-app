import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type Energy = 'high' | 'medium' | 'low';

interface EnergySelectorProps {
  onSelect: (energy: Energy) => void;
  selectedEnergy?: Energy | '';
  showResponse?: boolean;
}

const energyOptions: { key: Energy; emoji: string; color: string }[] = [
  { key: 'high', emoji: '⚡', color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' },
  { key: 'medium', emoji: '🔋', color: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700' },
  { key: 'low', emoji: '🔰', color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700' },
];

export function EnergySelector({ onSelect, selectedEnergy, showResponse = true }: EnergySelectorProps) {
  const { t } = useApp();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm mx-auto">
        {energyOptions.map((option, index) => (
          <motion.button
            key={option.key}
            onClick={() => !selectedEnergy && onSelect(option.key)}
            disabled={!!selectedEnergy}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
              option.color,
              selectedEnergy === option.key && 'ring-2 ring-primary ring-offset-2',
              selectedEnergy && selectedEnergy !== option.key && 'opacity-40 pointer-events-none'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={!selectedEnergy ? { scale: 1.05 } : {}}
            whileTap={!selectedEnergy ? { scale: 0.95 } : {}}
          >
            <span className="text-3xl">{option.emoji}</span>
            <span className="text-sm font-medium text-foreground min-h-[1.25rem]">
              {t(`energy.${option.key}` as any)}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Response area — shows X placeholder before selection, message after */}
      {showResponse && (
        <motion.div
          key={selectedEnergy || 'placeholder'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 rounded-xl bg-accent/20 border border-accent/30"
        >
          <p className="text-sm text-foreground">
            {selectedEnergy
              ? t(`energy.response.${selectedEnergy}` as any)
              : <span className="text-muted-foreground/70 text-xl font-medium"></span>}
          </p>
        </motion.div>
      )}
    </div>
  );
}
