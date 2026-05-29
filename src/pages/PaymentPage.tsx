import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAdmin } from '@/contexts/AdminContext';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Check,
  Shield,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Crown,
  Star,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

type PaymentStatus = 'idle' | 'processing' | 'verifying' | 'success' | 'error' | 'pending';

const PLANS = [
  {
    id: 'basico',
    icon: Zap,
    name: 'Plan Básico',
    duration: '1 mes',
    regular: '$80.000',
    price: '$45.000',
    promo: null as string | null,
    features: [
    ],
    highlight: false,
  },
  {
    id: 'intermedio',
    icon: Star,
    name: 'Plan Intermedio',
    duration: '',
    promo: '4 meses' as string | null,
    regular: '$320.000',
    price: '$90.000',
    features: [
      '10 micro-acciones de impacto inmediato (protocolo de alto rendimiento)',
      'Para Entender más (Grounding, acción, autocompasión)',
      'Infografía Protocolo de Alto Rendimiento',
      '30% desc Próximo Curso',
    ],
    highlight: false,
  },
  {
    id: 'premium',
    icon: Crown,
    name: 'Plan Premium',
    duration: '',
    promo: '8 meses' as string | null,
    regular: '$640.000',
    price: '$120.000',
    features: [
      'El código del hábito (Master Class)',
      'De la intención a la acción (50 micro-acciones …)',
      '60% desc. Próximo Curso',
    ],
    highlight: true,
  },
];

export default function PaymentPage() {
  const { t, locale, userEmail, setPaymentCompleted, setPlanType } = useApp();
  const { getUserStatus, addLog, reactivateUser } = useAdmin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  usePageTitle('Pago');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('basico');
  // Real per-plan prices fetched from the backend so the displayed amount
  // always equals the amount actually charged by MercadoPago.
  const [livePrices, setLivePrices] = useState<Record<string, string>>({});
  const es = locale.startsWith('es');

  useEffect(() => {
    api.payments.getPlans()
      .then((data) => {
        const map: Record<string, string> = {};
        const fmt = new Intl.NumberFormat('es-CO');
        (data.plans || []).forEach((p: { id: string; launch_price: number | string }) => {
          map[p.id] = `$${fmt.format(Number(p.launch_price))}`;
        });
        setLivePrices(map);
      })
      .catch(() => {/* fall back to static prices already in PLANS */});
  }, []);

  // Handle return from MercadoPago
  useEffect(() => {
    const status = searchParams.get('status');
    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
    const plan = searchParams.get('plan') || 'basico';

    if (status === 'approved' && paymentId) {
      setPaymentStatus('verifying');
      api.payments.verifyPayment(paymentId)
        .then((data) => {
          if (data.status === 'approved') {
            setPaymentStatus('success');
            setPaymentCompleted(true);
            setPlanType(data.plan_type || plan);

            const existingUser = getUserStatus(userEmail);
            if (existingUser) {
              reactivateUser(existingUser.id);
              addLog({
                userId: existingUser.id,
                userEmail: existingUser.email,
                eventType: 'payment_event',
                eventDetail: `MercadoPago payment ${data.payment_id} (${data.plan_type || plan})`,
              });
            }

            setTimeout(() => navigate('/'), 2000);
          } else {
            setPaymentStatus('pending');
          }
        })
        .catch(() => {
          // Do NOT grant access on verification failure. The server-side
          // webhook is the source of truth and will activate the account
          // once MercadoPago confirms the payment. Show a pending state.
          setPaymentStatus('pending');
        });
    } else if (status === 'failed') {
      setPaymentStatus('error');
      setErrorMessage(t('payment.error'));
    } else if (status === 'pending') {
      setPaymentStatus('pending');
    }
  }, [searchParams]);

  const handlePayment = async (planId: string) => {
    setSelectedPlan(planId);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const data = await api.payments.createPreference(planId);
      window.location.href = data.init_point;
    } catch (err: any) {
      setPaymentStatus('error');
      setErrorMessage(err.error || t('payment.error'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <Badge variant="secondary" className="mb-2">
            <Sparkles className="h-3 w-3 mr-1" />
            {t('payment.launchBadge')}
          </Badge>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {t('payment.subtitle')}
          </h1>
        </motion.div>

        {/* Status Messages */}
        {(paymentStatus === 'processing' || paymentStatus === 'verifying') && (
          <Alert className="mb-4 max-w-lg mx-auto">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription className="text-sm">
              {paymentStatus === 'verifying' ? 'Verificando pago...' : t('payment.processing')}
            </AlertDescription>
          </Alert>
        )}

        {paymentStatus === 'success' && (
          <Alert className="mb-4 max-w-lg mx-auto border-green-200 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-600">
              {t('payment.success')}
            </AlertDescription>
          </Alert>
        )}

        {paymentStatus === 'pending' && (
          <Alert className="mb-4 max-w-lg mx-auto border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-600">
              {es ? 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.' : 'Your payment is being processed. We will notify you when confirmed.'}
            </AlertDescription>
          </Alert>
        )}

        {paymentStatus === 'error' && (
          <Alert variant="destructive" className="mb-4 max-w-lg mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{errorMessage || t('payment.error')}</AlertDescription>
          </Alert>
        )}

        {/* 3 Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`h-full flex flex-col ${plan.highlight ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                <CardHeader className="text-center py-4 pb-2">
                  {plan.highlight && (
                    <Badge className="w-fit mx-auto mb-2 bg-primary text-primary-foreground">
                      {es ? 'Mejor valor' : 'Best value'}
                    </Badge>
                  )}
                  <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-primary/10">
                    <plan.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">
                    <p className="text-lg md:text-lg font-bold mb-3">{plan.duration}</p>
                    {plan.promo && (
                      <span className="block text-primary md:text-lg font-semibold mt-1">{plan.promo}</span>
                    )}
                  </CardDescription>
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground line-through">{plan.regular}</span>
                    <div>
                      <span className="text-4xl font-bold text-foreground">{livePrices[plan.id] ?? plan.price}</span>
                      <span className="text-muted-foreground text-xs"> COP</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 pb-4 flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1 mb-4">
                    {plan.features.map((feature, fi) => {
                      const isSpecial =
                        (plan.id === 'intermedio' && fi >= plan.features.length - 1) ||
                        (plan.id === 'premium' && fi >= plan.features.length - 2);
                      return (
                        <li key={fi}
                          className="flex items-start gap-2 text-sm font-semibold">
                          <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                          <span>
                            Para Entender más (<a className='border-b' href='/Entender más sobre el GROUNDING.mp4'>Grounding</a>, acción, <a className='border-b' href='/Mas sobre AUTOCOMPASION.mp4'>autocompasión</a>)
                          </span> :
                          <span className={isSpecial ? 'text-lg font-bold' : ''}>{feature}</span>
                        </li>
                      )
                    })}
                  </ul>

                  <Button
                    className="w-full rounded-full gap-2"
                    variant={plan.highlight ? 'default' : 'outline'}
                    onClick={() => handlePayment(plan.id)}
                    disabled={paymentStatus === 'processing' || paymentStatus === 'verifying' || paymentStatus === 'success'}
                  >
                    {paymentStatus === 'processing' && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {es ? 'Procesando...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        {es ? 'Elegir plan' : 'Choose plan'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Payment Provider */}
        <div className="max-w-lg mx-auto">
          <Card className="shadow-card mb-4">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">Mercado Pago</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {t('payment.provider')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            {t('payment.note')}
          </p>
        </div>
      </main>

      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-background/90 backdrop-blur-sm border-border/60 hover:bg-accent"
        onClick={() => navigate('/help')}
      >
        <HelpCircle className="h-5 w-5 text-muted-foreground" />
        <span className="sr-only">{t('nav.help')}</span>
      </Button>
    </div>
  );
}
