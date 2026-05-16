import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Info, HelpCircle, Heart, Phone, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';

interface FloatingHelpProps {
  className?: string;
}

export function FloatingHelp({ className }: FloatingHelpProps) {
  const { t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Navigate to help with return path stored in state (H.2 per PDF spec)
  const handleHelpClick = () => {
    navigate('/help', { state: { returnTo: location.pathname } });
  };

  const fullContent = (
    <div className="space-y-4">
      <p className="text-muted-foreground leading-relaxed">
        {t('ethical.fullText')}
      </p>

      <div className="pt-4 border-t border-border">
        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <Heart className="h-4 w-4 text-pink-500" />
          {t('ethical.resources')}
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">{t('ethical.crisis')}</p>
              <p className="text-xs text-muted-foreground">Disponible 24/7</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <UserRound className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">{t('ethical.professional')}</p>
              <p className="text-xs text-muted-foreground">Busca apoyo profesional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        className={`fixed bottom-20 right-4 z-40 flex flex-col gap-2 ${className || ''}`}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full shadow-lg bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900"
          aria-label={t('floatingHelp.ethical' as any)}
        >
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleHelpClick}
          className="h-12 w-12 rounded-full shadow-lg bg-background hover:bg-accent"
          aria-label={t('floatingHelp.help' as any)}
        >
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </Button>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              {t('ethical.title')}
            </DialogTitle>
          </DialogHeader>
          {fullContent}
          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsOpen(false)} className="rounded-full">
              {t('ethical.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
