import { useApp } from '@/contexts/AppContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function TermsPage() {
  const { locale } = useApp();
  usePageTitle('Términos y Condiciones');
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
            {isSpanish ? 'Términos de Servicio' : 'Terms of Service'}
          </h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isSpanish ? '1. Aceptación' : '1. Acceptance'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  {isSpanish
                    ? 'Al acceder y utilizar Báltica Education, aceptas estos Términos de Servicio. Si no estás de acuerdo, no podrás acceder al servicio.'
                    : 'By accessing and using Báltica Education, you agree to these Terms of Service. If you disagree, you may not access the service.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isSpanish ? '2. Descripción del Servicio' : '2. Description of Service'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  {isSpanish
                    ? 'Báltica Education es una plataforma de bienestar educativo que ofrece contenido de autocuidado. Este servicio es educativo y no sustituye atención médica o psicológica profesional.'
                    : 'Báltica Education is an educational wellness platform that offers self-care content. This service is educational and does not replace professional medical or psychological care.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isSpanish ? '3. Cuenta y Pago' : '3. Account and Payment'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  {isSpanish
                    ? 'Para usar el servicio debes crear una cuenta con información precisa. El acceso requiere un pago único y tendrás acceso durante 60 días.'
                    : 'To use the service you must create an account with accurate information. Access requires a one-time payment and you will have access for 60 days.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isSpanish ? '4. Propiedad Intelectual' : '4. Intellectual Property'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  {isSpanish
                    ? 'Todo el contenido de Báltica Education está protegido por derechos de autor. No puedes copiar, distribuir o modificar ningún contenido sin autorización.'
                    : 'All content on Báltica Education is protected by copyright. You may not copy, distribute, or modify any content without authorization.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isSpanish ? '5. Contacto' : '5. Contact'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  {isSpanish
                    ? 'Si tienes preguntas sobre estos términos, contáctanos en:'
                    : 'If you have questions about these terms, contact us at:'}
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
