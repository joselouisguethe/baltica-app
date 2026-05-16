import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Info, Heart, Phone, UserRound, X } from 'lucide-react';

interface EthicalNoteProps {
  variant?: 'card' | 'modal' | 'inline';
  showTrigger?: boolean;
}

export function EthicalNote({ variant = 'modal', showTrigger = true }: EthicalNoteProps) {
  const { t } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const content = (
    <div className="space-y-4">
      <p className="text-muted-foreground text-red-500 leading-relaxed">
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

  // Inline variant - compact card for embedding in pages
  if (variant === 'inline') {
    return (
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">{t('ethical.shortTitle')}</h4>
              <p className="text-sm text-muted-foreground">{t('ethical.text')}</p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" className="p-0 h-auto text-sm text-primary">
                    {t('ethical.link')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      {t('ethical.title')}
                    </DialogTitle>
                  </DialogHeader>
                  {content}
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => setIsOpen(false)} className="rounded-full">
                      {t('ethical.close')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card variant - full card for dedicated sections
  if (variant === 'card') {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-primary" />
            {t('ethical.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  // Modal variant (default) - button that opens a dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Info className="h-4 w-4" />
            <span className="sr-only">{t('ethical.title')}</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            {t('ethical.title')}
          </DialogTitle>
        </DialogHeader>
        {content}
        <div className="flex justify-end mt-4">
          <Button onClick={() => setIsOpen(false)} className="rounded-full">
            {t('ethical.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export a hook to control the modal programmatically
export function useEthicalNote() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
