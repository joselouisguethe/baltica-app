import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/layout/Header';
import { EthicalFooter } from '@/components/EthicalFooter';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/usePageTitle';
import { api } from '@/lib/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function DiplomaPage() {
  const { locale, userName, userEmail } = useApp();
  const navigate = useNavigate();
  const diplomaRef = useRef<HTMLDivElement>(null);
  const es = locale.startsWith('es');
  usePageTitle(es ? 'Diploma' : 'Certificate');

  const [loading, setLoading] = useState(true);
  const [diploma, setDiploma] = useState<{ id: string; issued_at: string } | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Try to issue (idempotent — returns existing if already issued)
        const data = await api.diplomas.issue();
        setDiploma(data.diploma);
      } catch (err: any) {
        setError(err.error || (es ? 'No puedes acceder al diploma aún.' : 'You cannot access the diploma yet.'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const issuedDate = diploma
    ? new Date(diploma.issued_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  const handleDownload = async () => {
    if (!diplomaRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(diplomaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Diploma_Baltica_${userName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-lg text-center">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{es ? 'Diploma no disponible' : 'Diploma not available'}</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/')} variant="outline" className="gap-2 rounded-full px-8">
            <ArrowLeft className="h-4 w-4" />
            {es ? 'Volver al inicio' : 'Back to home'}
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {es ? '¡Felicidades! Tu diploma está listo' : 'Congratulations! Your diploma is ready'}
            </h1>
            <p className="text-muted-foreground">
              {es ? 'Descárgalo para enmarcarlo e imprimir.' : 'Download it to frame and print.'}
            </p>
          </div>

          {/* Diploma preview */}
          <div className="mb-6 overflow-x-auto">
            <div
              ref={diplomaRef}
              className="mx-auto"
              style={{
                width: '842px',
                height: '595px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e8f4f8 50%, #f0fdf4 100%)',
                position: 'relative',
                fontFamily: 'Georgia, serif',
                overflow: 'hidden',
              }}
            >
              {/* Border */}
              <div style={{
                position: 'absolute', inset: '12px',
                border: '3px solid #10B0C0',
                borderRadius: '4px',
              }} />
              <div style={{
                position: 'absolute', inset: '18px',
                border: '1px solid #10B0C0',
                borderRadius: '2px',
              }} />

              {/* Content */}
              <div style={{
                position: 'absolute', inset: '30px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '20px',
              }}>
                {/* Logo text */}
                <div style={{ fontSize: '18px', letterSpacing: '6px', color: '#102050', marginBottom: '8px', fontWeight: 700 }}>
                  BÁLTICA EDUCATION
                </div>

                <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#4A627A', marginBottom: '24px', textTransform: 'uppercase' }}>
                  {es ? 'Bienestar Digital y Salud Mental' : 'Digital Wellness & Mental Health'}
                </div>

                {/* Title */}
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#102050', marginBottom: '8px', letterSpacing: '2px' }}>
                  {es ? 'CERTIFICADO DE BIENESTAR' : 'WELLNESS CERTIFICATE'}
                </div>

                <div style={{ width: '120px', height: '3px', background: '#10B0C0', marginBottom: '20px' }} />

                <div style={{ fontSize: '14px', color: '#4A627A', marginBottom: '8px' }}>
                  {es ? 'Se otorga a' : 'Awarded to'}
                </div>

                {/* Name */}
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#102050', marginBottom: '4px' }}>
                  {userName || userEmail.split('@')[0]}
                </div>

                <div style={{ width: '200px', height: '1px', background: '#10B0C0', marginBottom: '16px' }} />

                <div style={{ fontSize: '13px', color: '#4A627A', maxWidth: '500px', lineHeight: 1.6, marginBottom: '20px' }}>
                  {es
                    ? 'Por completar exitosamente el Reto Báltica de 3 Días, demostrando compromiso con su bienestar emocional y salud mental a través de técnicas de Grounding, Acción con Propósito y Autocompasión.'
                    : 'For successfully completing the 3-Day Báltica Challenge, demonstrating commitment to emotional wellbeing and mental health through Grounding, Purposeful Action, and Self-Compassion techniques.'}
                </div>

                {/* Date */}
                <div style={{ fontSize: '12px', color: '#4A627A' }}>
                  {issuedDate}
                </div>

                {/* Decorative corners */}
                <div style={{ position: 'absolute', top: '8px', left: '8px', width: '40px', height: '40px', borderTop: '2px solid #B0E090', borderLeft: '2px solid #B0E090' }} />
                <div style={{ position: 'absolute', top: '8px', right: '8px', width: '40px', height: '40px', borderTop: '2px solid #B0E090', borderRight: '2px solid #B0E090' }} />
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '40px', height: '40px', borderBottom: '2px solid #B0E090', borderLeft: '2px solid #B0E090' }} />
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '40px', height: '40px', borderBottom: '2px solid #B0E090', borderRight: '2px solid #B0E090' }} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleDownload} disabled={downloading} size="lg" className="gap-2 rounded-full px-8">
              <Download className="h-4 w-4" />
              {downloading ? (es ? 'Generando PDF...' : 'Generating PDF...') : (es ? 'Descargar Diploma PDF' : 'Download Diploma PDF')}
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" size="lg" className="gap-2 rounded-full px-8">
              <ArrowLeft className="h-4 w-4" />
              {es ? 'Volver al inicio' : 'Back to home'}
            </Button>
          </div>
        </motion.div>
      </main>
      <EthicalFooter />
    </div>
  );
}
