import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/layout/Header';
import { EthicalFooter } from '@/components/EthicalFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, ArrowRight, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/usePageTitle';
import { api } from '@/lib/api';

export default function SatisfactionSurveyPage() {
  const { t, locale, userEmail, userName } = useApp();
  const navigate = useNavigate();
  usePageTitle(locale.startsWith('es') ? 'Encuesta de Satisfacción' : 'Satisfaction Survey');

  const [loading, setLoading] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [contactAuthorized, setContactAuthorized] = useState<string>('');

  // Survey questions
  const [overallRating, setOverallRating] = useState<string>('');
  const [wouldRecommend, setWouldRecommend] = useState<string>('');
  const [mostHelpful, setMostHelpful] = useState('');
  const [improvement, setImprovement] = useState('');

  // Pre-fill name if available
  useEffect(() => {
    if (userName) {
      const parts = userName.trim().split(' ');
      if (parts.length >= 2) {
        setFirstName(parts[0]);
        setLastName(parts.slice(1).join(' '));
      } else {
        setFirstName(userName);
      }
    }
  }, [userName]);

  // Check if already submitted
  useEffect(() => {
    api.surveys.get()
      .then(data => {
        if (data.survey) {
          setAlreadySubmitted(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isValid = firstName.trim() && lastName.trim() && phone.trim() && email.trim() && contactAuthorized && overallRating && wouldRecommend;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await api.surveys.submit({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        contact_authorized: contactAuthorized === 'yes',
        responses: {
          overallRating,
          wouldRecommend,
          mostHelpful: mostHelpful.trim(),
          improvement: improvement.trim(),
        },
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Survey submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const es = locale.startsWith('es');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-lg text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {es ? 'Encuesta ya completada' : 'Survey already completed'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {es ? 'Ya completaste la encuesta de satisfacción. ¡Gracias!' : 'You already completed the satisfaction survey. Thank you!'}
          </p>
          <Button onClick={() => navigate('/')} className="gap-2 rounded-full px-8">
            {es ? 'Ir al inicio' : 'Go to home'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </main>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-lg text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">
            {es ? '¡Gracias por tu opinión!' : 'Thank you for your feedback!'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {es ? 'Tu encuesta ha sido registrada. Ahora puedes acceder a tu diploma y materiales adicionales.' : 'Your survey has been recorded. You can now access your diploma and additional materials.'}
          </p>
          <Button onClick={() => navigate('/diploma')} className="gap-2 rounded-full px-8">
            {es ? 'Ver mi diploma' : 'View my diploma'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-6">
            <ClipboardCheck className="h-10 w-10 text-primary mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {es ? 'Encuesta de Satisfacción' : 'Satisfaction Survey'}
            </h1>
            <p className="text-muted-foreground">
              {es ? 'Completa esta encuesta para acceder a tu diploma y materiales adicionales.' : 'Complete this survey to access your diploma and additional materials.'}
            </p>
          </div>

          {/* Personal info */}
          <Card className="shadow-card mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {es ? 'Datos personales' : 'Personal information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{es ? 'Nombre' : 'First name'} *</Label>
                  <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder={es ? 'Tu nombre' : 'Your first name'} />
                </div>
                <div>
                  <Label htmlFor="lastName">{es ? 'Apellido' : 'Last name'} *</Label>
                  <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder={es ? 'Tu apellido' : 'Your last name'} />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">{es ? 'Celular' : 'Phone'} *</Label>
                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={es ? 'Tu número de celular' : 'Your phone number'} />
              </div>
              <div>
                <Label htmlFor="email">{es ? 'Correo electrónico' : 'Email'} *</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={es ? 'Tu correo' : 'Your email'} />
              </div>
              <div>
                <Label className="mb-2 block">
                  {es ? '¿Autorizas que te contactemos?' : 'Do you authorize us to contact you?'} *
                </Label>
                <RadioGroup value={contactAuthorized} onValueChange={setContactAuthorized}>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="yes" id="contact-yes" />
                    <Label htmlFor="contact-yes" className="cursor-pointer">{es ? 'Sí' : 'Yes'}</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="no" id="contact-no" />
                    <Label htmlFor="contact-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Survey questions */}
          <Card className="shadow-card mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {es ? 'Tu experiencia' : 'Your experience'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">
                  {es ? '¿Cómo calificarías tu experiencia general con el Reto Báltica?' : 'How would you rate your overall experience with the Báltica Challenge?'} *
                </Label>
                <RadioGroup value={overallRating} onValueChange={setOverallRating}>
                  {[
                    { value: '5', label: es ? 'Excelente' : 'Excellent' },
                    { value: '4', label: es ? 'Muy buena' : 'Very good' },
                    { value: '3', label: es ? 'Buena' : 'Good' },
                    { value: '2', label: es ? 'Regular' : 'Fair' },
                    { value: '1', label: es ? 'Mala' : 'Poor' },
                  ].map(opt => (
                    <div key={opt.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value={opt.value} id={`rating-${opt.value}`} />
                      <Label htmlFor={`rating-${opt.value}`} className="cursor-pointer">{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">
                  {es ? '¿Recomendarías el Reto Báltica a alguien más?' : 'Would you recommend the Báltica Challenge to someone else?'} *
                </Label>
                <RadioGroup value={wouldRecommend} onValueChange={setWouldRecommend}>
                  {[
                    { value: 'definitely', label: es ? 'Definitivamente sí' : 'Definitely yes' },
                    { value: 'probably', label: es ? 'Probablemente sí' : 'Probably yes' },
                    { value: 'not_sure', label: es ? 'No estoy seguro/a' : 'Not sure' },
                    { value: 'probably_not', label: es ? 'Probablemente no' : 'Probably not' },
                    { value: 'no', label: es ? 'No' : 'No' },
                  ].map(opt => (
                    <div key={opt.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value={opt.value} id={`recommend-${opt.value}`} />
                      <Label htmlFor={`recommend-${opt.value}`} className="cursor-pointer">{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="mostHelpful" className="mb-2 block">
                  {es ? '¿Qué fue lo que más te ayudó del reto?' : 'What helped you the most from the challenge?'}
                </Label>
                <Textarea
                  id="mostHelpful"
                  value={mostHelpful}
                  onChange={e => setMostHelpful(e.target.value)}
                  placeholder={es ? 'Comparte tu experiencia...' : 'Share your experience...'}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="improvement" className="mb-2 block">
                  {es ? '¿Qué mejorarías del programa?' : 'What would you improve about the program?'}
                </Label>
                <Textarea
                  id="improvement"
                  value={improvement}
                  onChange={e => setImprovement(e.target.value)}
                  placeholder={es ? 'Tus sugerencias...' : 'Your suggestions...'}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              size="lg"
              className="gap-2 rounded-full px-10"
            >
              {submitting
                ? (es ? 'Enviando...' : 'Submitting...')
                : (es ? 'Enviar encuesta' : 'Submit survey')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </main>
      <EthicalFooter />
    </div>
  );
}
