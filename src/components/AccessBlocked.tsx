import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, Clock, Mail } from 'lucide-react';
import BalticaLogo from '@/components/brand/BalticaLogo';

interface AccessBlockedProps {
  reason: 'suspended' | 'expired';
}

export function AccessBlocked({ reason }: AccessBlockedProps) {
  const { logout } = useApp();

  const content = reason === 'suspended'
    ? {
        icon: ShieldAlert,
        title: 'Acceso suspendido',
        message: 'Tu acceso al programa ha sido suspendido. Si crees que esto es un error, por favor contacta con soporte.',
      }
    : {
        icon: Clock,
        title: 'Acceso expirado',
        message: 'Tu periodo de acceso al programa ha finalizado. Contacta con soporte para renovar tu acceso.',
      };

  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-card">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <BalticaLogo size={40} />
          </div>

          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Icon className="h-8 w-8 text-destructive" />
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">{content.title}</h2>
          <p className="text-muted-foreground mb-6">{content.message}</p>

          <div className="space-y-3">
            <Button variant="outline" className="w-full gap-2" asChild>
              <a href="mailto:servicioalcliente@balticaeducation.com">
                <Mail className="h-4 w-4" /> Contactar soporte
              </a>
            </Button>
            <Button variant="ghost" className="w-full" onClick={logout}>
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
