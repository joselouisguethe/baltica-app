import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Clock, Play, Save } from 'lucide-react';
import { motion } from 'framer-motion';

interface InactivityModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onSaveLater: () => void;
}

export function InactivityModal({ isOpen, onContinue, onSaveLater }: InactivityModalProps) {
  const { t } = useApp();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onContinue()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div
            className="mx-auto mb-4 w-16 h-16 rounded-full bg-accent/30 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            <Clock className="h-8 w-8 text-primary" />
          </motion.div>
          <DialogTitle className="text-xl">
            {t('inactivity.title' as any)}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {t('inactivity.message' as any)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={onContinue}
            className="w-full gap-2 rounded-full"
            size="lg"
          >
            <Play className="h-4 w-4" />
            {t('inactivity.continue' as any)}
          </Button>

          <Button
            variant="outline"
            onClick={onSaveLater}
            className="w-full gap-2 rounded-full"
            size="lg"
          >
            <Save className="h-4 w-4" />
            {t('inactivity.saveLater' as any)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
