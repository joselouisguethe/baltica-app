import { useApp } from '@/contexts/AppContext';
import { useAdmin } from '@/contexts/AdminContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProgressRing } from '@/components/journey/ProgressRing';
import { DayCard } from '@/components/journey/DayCard';
import { ArrowRight, Clock, Heart, Sparkles, ShieldAlert, Mail, HelpCircle } from 'lucide-react';
import BalticaLogo from '@/components/brand/BalticaLogo';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { t, locale, progress, totalDays, userName, setUserName, userEmail, paymentCompleted } = useApp();
  const { getUserStatus } = useAdmin();
  const navigate = useNavigate();
  usePageTitle('Mi Programa');
  const userStatus = getUserStatus(userEmail);
  const isSuspended = userStatus?.status === 'suspended';
  const isExpired = userStatus?.status === 'expired';
  const canAccessJourney = paymentCompleted && !isSuspended && !isExpired;
  
  const hasStarted = progress.completedDays.length > 0;
  const programComplete = progress.completedDays.includes(3);
  const retoDaysCompleted = progress.completedDays.filter(d => d > 0).length;
  const progressPercent = Math.min((retoDaysCompleted / totalDays) * 100, 100);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('journey.greeting.morning');
    if (hour < 18) return t('journey.greeting.afternoon');
    return t('journey.greeting.evening');
  };

  // Visible days: [0, 2, 3] → displayed as "1", "2", "3" (day 1 is merged into day 0)
  const visibleDays = [0, 2, 3];

  const getDayStatus = (day: number): 'completed' | 'current' | 'locked' => {
    if (day === 0) {
      // Día 1 is complete only when both internal days 0 and 1 are done
      if (progress.completedDays.includes(0) && progress.completedDays.includes(1)) return 'completed';
      if (progress.currentDay <= 1) return 'current';
      return 'locked';
    }
    if (progress.completedDays.includes(day)) return 'completed';
    if (day === progress.currentDay) return 'current';
    return 'locked';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Status Banner */}
        {isSuspended && (
          <Alert className="mb-6 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <AlertDescription className="flex items-center justify-between">
              <span>{t('status.suspended')}</span>
              <a href="mailto:info@balticaeducation.com" className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline ml-2">
                <Mail className="h-3 w-3" /> {t('status.contactSupport')}
              </a>
            </AlertDescription>
          </Alert>
        )}
        {isExpired && (
          <Alert className="mb-6 border-red-200 bg-red-50/50 dark:bg-red-950/20">
            <Clock className="h-4 w-4 text-red-600" />
            <AlertDescription className="flex items-center justify-between">
              <span>{t('status.expired')}</span>
              <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => navigate('/payment')}>
                {t('status.repay')}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {!paymentCompleted && !isSuspended && !isExpired && (
          <Alert className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <ShieldAlert className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex items-center justify-between">
              <span>{locale.startsWith('es') ? 'Completa tu pago para acceder al programa.' : 'Complete your payment to access the program.'}</span>
              <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => navigate('/payment')}>
                {locale.startsWith('es') ? 'Ir a pagar' : 'Go to payment'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <motion.section
          className="text-center py-6 md:py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {hasStarted ? (
            <>
              <p className="text-base text-muted-foreground mb-1">
                {getGreeting()}{userName && `, ${userName}`}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('journey.day')} {progress.currentDay === 0 ? 1 : progress.currentDay} {t('journey.of')} {totalDays}
              </h1>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-block mb-4"
              >
                <BalticaLogo variant="isotipo" size={64} className="mx-auto" />
              </motion.div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
                {t('welcome.title')}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-lg mx-auto">
                {t('welcome.subtitle')}
              </p>
            </>
          )}

          {/* Progress Ring */}
          {hasStarted && (
            <motion.div
              className="flex justify-center mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ProgressRing progress={progressPercent} size={120} strokeWidth={10}>
                <div className="text-center">
                  <span className="text-2xl font-bold text-primary">
                    {retoDaysCompleted}
                  </span>
                  <span className="text-muted-foreground text-xs block">
                    / {totalDays}
                  </span>
                </div>
              </ProgressRing>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              size="lg"
              className="gap-2 px-8 py-6 text-lg rounded-full shadow-soft"
              disabled={!canAccessJourney}
              onClick={() => !canAccessJourney ? navigate('/payment') : programComplete ? navigate('/progress') : navigate(`/journey/${progress.currentDay}`)}
            >
              {programComplete
                ? (locale.startsWith('es') ? 'Ver mi progreso' : 'See my progress')
                : hasStarted ? t('welcome.continue') : t('welcome.cta')}
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <p className="text-sm text-muted-foreground mt-3 flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              {t('welcome.tagline')}
            </p>
          </motion.div>
        </motion.section>

        {/* Features */}
        {!hasStarted && (
          <motion.section
            className="grid grid-cols-3 gap-3 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { icon: Clock, title: '10 min', desc: 'Experiencias breves' },
              { icon: Heart, title: '3 días', desc: 'Programa transformador' },
              { icon: Sparkles, title: 'Tu ritmo', desc: 'Avanza a tu manera' },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-4 text-center shadow-card"
              >
                <feature.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-foreground text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </motion.section>
        )}

        {/* Day Grid - MVP 4 days (Welcome + 3 days) */}
        {hasStarted && (
          <motion.section
            className="py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
              {t('progress.title')}
            </h2>
            <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-sm mx-auto">
              {visibleDays.map(day => (
                <DayCard
                  key={day}
                  day={day}
                  status={canAccessJourney ? getDayStatus(day) : 'locked'}
                  onClick={() => canAccessJourney && getDayStatus(day) !== 'locked' && navigate(`/journey/${day}`)}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Streak */}
        {progress.streak > 0 && (
          <motion.div
            className="mt-4 p-4 bg-accent/30 rounded-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-base font-medium text-foreground">
              🔥 {progress.streak} {progress.streak === 1 ? (locale.startsWith('es') ? 'día' : 'day') : t('progress.days')} {t('progress.streak').toLowerCase()}
            </p>
            <p className="text-sm text-muted-foreground">{t('progress.keep')}</p>
          </motion.div>
        )}
      </main>

      {/* Floating Help Button - bottom right */}
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
};

export default Index;
