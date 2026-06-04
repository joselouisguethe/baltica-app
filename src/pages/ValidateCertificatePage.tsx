import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/usePageTitle';
import { api } from '@/lib/api';
import BalticaLogo from '@/components/brand/BalticaLogo';

interface ValidationResult {
  valid: boolean;
  name?: string;
  issued_at?: string;
  validation_code?: string;
  program?: string;
}

export default function ValidateCertificatePage() {
  const { code } = useParams<{ code: string }>();
  const { locale } = useApp();
  const es = locale.startsWith('es');
  usePageTitle(es ? 'Verificar certificado' : 'Verify certificate');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    if (!code) {
      setResult({ valid: false });
      setLoading(false);
      return;
    }
    api.diplomas
      .validate(code)
      .then((data) => setResult(data))
      .catch(() => setResult({ valid: false }))
      .finally(() => setLoading(false));
  }, [code]);

  const issuedDate = result?.issued_at
    ? new Date(result.issued_at).toLocaleDateString(es ? 'es-CO' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/40 py-4">
        <div className="container mx-auto px-4 flex justify-center">
          <Link to="/">
            <BalticaLogo variant="header" size={72} />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-lg flex-1 flex items-center justify-center">
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        ) : result?.valid ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <Card className="shadow-card">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-1">
                  {es ? 'Certificado válido' : 'Valid certificate'}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {es
                    ? 'Este certificado fue emitido por Báltica Education.'
                    : 'This certificate was issued by Báltica Education.'}
                </p>

                <div className="text-left space-y-3 bg-muted/30 rounded-xl p-5">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      {es ? 'Otorgado a' : 'Awarded to'}
                    </div>
                    <div className="text-lg font-semibold">{result.name}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      {es ? 'Programa' : 'Program'}
                    </div>
                    <div className="font-medium">{result.program}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      {es ? 'Fecha de emisión' : 'Issue date'}
                    </div>
                    <div className="font-medium">{issuedDate}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      {es ? 'Código' : 'Code'}
                    </div>
                    <div className="font-mono text-sm break-all">{result.validation_code}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full text-center"
          >
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              {es ? 'Certificado no encontrado' : 'Certificate not found'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {es
                ? 'No pudimos verificar este código. Revisa que esté completo y correcto.'
                : 'We could not verify this code. Please check that it is complete and correct.'}
            </p>
            <Button asChild variant="outline" className="gap-2 rounded-full px-8">
              <Link to="/">
                <Award className="h-4 w-4" />
                {es ? 'Ir a Báltica Education' : 'Go to Báltica Education'}
              </Link>
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
