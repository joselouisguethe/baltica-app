import { useApp } from '@/contexts/AppContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  const { locale } = useApp();
  usePageTitle('Política de Privacidad');
  const isSpanish = locale.startsWith('es');

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-8">
            {isSpanish ? 'Política de Privacidad' : 'Privacy Policy'}
          </h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isSpanish ? '1. Información que Recopilamos' : '1. Information We Collect'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  {isSpanish
                    ? 'Recopilamos la siguiente información cuando usas Báltica Education:'
                    : 'We collect the following information when you use Báltica Education:'}
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{isSpanish ? 'Nombre y correo electrónico' : 'Name and email address'}</li>
                  <li>{isSpanish ? 'Progreso en el programa' : 'Program progress'}</li>
                  <li>{isSpanish ? 'Respuestas a ejercicios' : 'Exercise responses'}</li>
                  <li>{isSpanish ? 'Preferencias de configuración' : 'Settings preferences'}</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isSpanish ? '2. Uso de tu Información' : '2. Use of Your Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  {isSpanish
                    ? 'Utilizamos tu información para proporcionar y mejorar el servicio, guardar tu progreso, y comunicarnos contigo sobre tu cuenta.'
                    : 'We use your information to provide and improve the service, save your progress, and communicate with you about your account.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isSpanish ? '3. Protección de Datos' : '3. Data Protection'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  {isSpanish
                    ? 'Tus datos se almacenan de forma segura. No vendemos ni compartimos tu información personal con terceros, excepto para procesar pagos o cuando sea requerido por ley.'
                    : 'Your data is stored securely. We do not sell or share your personal information with third parties, except for payment processing or when required by law.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isSpanish ? '4. Tus Derechos' : '4. Your Rights'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  {isSpanish
                    ? 'Tienes derecho a acceder, corregir o eliminar tus datos personales. Para ejercer estos derechos, contáctanos en:'
                    : 'You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at:'}
                </p>
                <p className="font-medium text-foreground">servicioalcliente@balticaeducation.com</p>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground text-center pt-4">
              {isSpanish
                ? 'Última actualización: Febrero 2026'
                : 'Last updated: February 2026'}
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
