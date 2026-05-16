import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Info, Heart, Phone, UserRound } from 'lucide-react';

export function EthicalFooter() {
  const { t } = useApp();
  const [isOpen, setIsOpen] = useState(false);

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
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-red-700/95 backdrop-blur-sm border-t border-red-200 dark:border-red-600">
        <div className="container mx-auto px-4 py-3 max-w-2xl">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center gap-2 w-full hover:opacity-80 transition-opacity"
          >
            <Info className="h-4 w-4 text-red-400 dark:text-white" />
            <span className="text-sm font-semibold text-red-400 dark:text-white underline">
              {t('ethical.link')}
            </span>
          </button>
        </div>
      </div>

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
