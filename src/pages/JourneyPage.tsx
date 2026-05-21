/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useCelebration } from '@/hooks/useCelebration';
import { useInactivity } from '@/hooks/useInactivity';
import { Header } from '@/components/layout/Header';
import { StepIndicator, Step } from '@/components/journey/StepIndicator';
import { VideoPlayer } from '@/components/journey/VideoPlayer';
import { AudioPlayer } from '@/components/journey/AudioPlayer';
import { MoodSelector } from '@/components/journey/MoodSelector';
import { EnergySelector, Energy } from '@/components/journey/EnergySelector';
import { EthicalFooter } from '@/components/EthicalFooter';
import { FloatingHelp } from '@/components/FloatingHelp';
import { InactivityModal } from '@/components/InactivityModal';
import { CelebrationModal } from '@/components/celebrations/CelebrationModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Download, CheckCircle, Sparkles, Play } from 'lucide-react';
import BalticaLogo from '@/components/brand/BalticaLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTitle } from '@/hooks/usePageTitle';
import { dayContents, day0ExtendedContent, day1Content, valueOptions, timeSlotOptions } from '@/config/content';

type JourneyStep = Step;

// Day 0 sub-steps: merged Día 1 (Bienvenida + Grounding)
const DAY0_SUBSTEPS = [
  'start',
  'video-welcome',     // Día 1: Bienvenida
  'survey-before',     // Encuesta mood/energy
  'video-intro',       // Día 1: Introducción
  'video-grounding',   // Día 1: Grounding
  'audio-grounding',   // Audio meditación grounding
  'five-senses',       // Ejercicio 5 sentidos (from Day 1)
  'download',          // PDFs
  'closure',
] as const;
type Day0SubStep = typeof DAY0_SUBSTEPS[number];

export default function JourneyPage() {
  const { day } = useParams<{ day: string }>();
  const navigate = useNavigate();
  const { t, locale, progress, completeDay, setCurrentStep: persistStep, setDay0Step: persistDay0Step, totalDays, dayAnswers, saveDayAnswers } = useApp();
  const { sendAchievement } = useNotificationContext();
  const { celebration, closeCelebration, checkAndTriggerCelebration } = useCelebration();

  const dayNumber = parseInt(day || '0', 10);

  // Day 1 is merged into Day 0 — redirect
  if (dayNumber === 1) {
    navigate('/journey/0', { replace: true });
    return null;
  }

  // Restore step position from persisted progress
  const [currentStep, setCurrentStepLocal] = useState<JourneyStep>(
    dayNumber === progress.currentDay ? progress.currentStep : 'start'
  );
  const [completedSteps, setCompletedSteps] = useState<JourneyStep[]>([]);
  const [day0Step, setDay0StepLocal] = useState(
    dayNumber === 0 && progress.currentDay === 0 ? (progress.day0Step ?? 0) : 0
  );

  // Sync step changes to persisted progress
  const setCurrentStep = (step: JourneyStep) => {
    setCurrentStepLocal(step);
    persistStep(step);
  };
  const setDay0Step = (step: number) => {
    setDay0StepLocal(step);
    persistDay0Step(step);
  };

  const dayContent = dayContents[dayNumber];
  const displayDay = dayNumber === 0 ? 1 : dayNumber;
  usePageTitle(`Día ${displayDay}`);
  const localeKey = locale as 'es-LATAM' | 'es-ES' | 'en';

  // Local form state for each day's exercises
  const [selectedMood, setSelectedMood] = useState<string>(
    dayNumber === 0 ? (dayAnswers.welcome?.mood || '') : (dayAnswers.day3?.mood || '')
  );
  const [words, setWords] = useState<[string, string, string]>(
    dayAnswers.day1?.words || ['', '', '']
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(dayAnswers.day1?.timeSlot || '');
  const [selectedValue, setSelectedValue] = useState(dayAnswers.day2?.value || '');
  const [customValue, setCustomValue] = useState(dayAnswers.day2?.customValue || '');
  const [day2Action, setDay2Action] = useState(dayAnswers.day2?.action || '');
  const [day2TimeSlot, setDay2TimeSlot] = useState(dayAnswers.day2?.timeSlot || '');
  const [wordsAfter, setWordsAfter] = useState<[string, string, string]>(
    dayAnswers.day2?.wordsAfter || ['', '', '']
  );
  const [gratitudes, setGratitudes] = useState<[string, string, string]>(
    dayAnswers.day3?.gratitudes || ['', '', '']
  );
  const [kindPhrase, setKindPhrase] = useState(dayAnswers.day3?.kindPhrase || '');
  const [nextAction, setNextAction] = useState(dayAnswers.day3?.nextAction || '');

  // Energy state for Day 0 and Day 3 (second measurement item per client spec)
  const [selectedEnergy, setSelectedEnergy] = useState<Energy | ''>(
    dayNumber === 0 ? (dayAnswers.welcome?.energy || '') : (dayAnswers.day3?.energy || '')
  );

  // Video gallery state for Day 0
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string; duration: string } | null>(null);

  // Inactivity modal state
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  // Inactivity detection - show reminder after 5 minutes of inactivity
  const { resetTimer } = useInactivity({
    timeout: 5 * 60 * 1000, // 5 minutes
    onInactive: () => setShowInactivityModal(true),
    enabled: currentStep !== 'closure', // Don't track on closure step
  });

  const markStepComplete = (step: JourneyStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const nextStep = () => {
    if (dayNumber === 0) {
      // Day 0 uses its own sub-step system
      if (day0Step < DAY0_SUBSTEPS.length - 1) {
        setDay0Step(day0Step + 1);
      }
      return;
    }
    // Days 1-3: full flow with video, audio, download, survey
    const steps: JourneyStep[] = ['start', 'video', 'audio', 'download', 'survey', 'closure'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      markStepComplete(currentStep);
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    if (dayNumber === 0) {
      if (day0Step > 0) {
        setDay0Step(day0Step - 1);
      } else {
        navigate('/');
      }
      return;
    }
    const steps: JourneyStep[] = ['start', 'video', 'audio', 'download', 'survey', 'closure'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      navigate('/');
    }
  };

  const canProceedFromSurvey = (): boolean => {
    switch (dayNumber) {
      case 0:
        return !!selectedMood && !!selectedEnergy;
      case 1:
        return words.every(w => w.trim()) && !!selectedTimeSlot;
      case 2:
        return !!customValue.trim() && !!day2Action.trim() && !!day2TimeSlot.trim();
      case 3:
        return !!selectedMood && !!selectedEnergy && gratitudes.every(g => g.trim()) && !!kindPhrase.trim() && !!nextAction.trim();
      default:
        return true;
    }
  };

  const saveCurrentAnswers = () => {
    const now = new Date().toISOString();
    switch (dayNumber) {
      case 0:
        saveDayAnswers({
          welcome: {
            mood: selectedMood, energy: selectedEnergy as Energy,
            moodBefore: selectedMood, energyBefore: selectedEnergy as Energy,
            ethicalNoteViewed: true, welcomeVideoWatched: true, introVideoWatched: true,
            completedAt: now,
          },
          day1: {
            words, timeSlot: selectedTimeSlot as any,
            videoWatched: true, audioCompleted: true, completedAt: now,
          },
        });
        break;
      case 1:
        saveDayAnswers({ day1: { words, timeSlot: selectedTimeSlot as any, videoWatched: true, audioCompleted: true, completedAt: now } });
        break;
      case 2:
        saveDayAnswers({ day2: { value: customValue, customValue, action: day2Action, timeSlot: day2TimeSlot as any, wordsAfter, videoWatched: true, audioCompleted: true, completedAt: now } });
        break;
      case 3:
        saveDayAnswers({ day3: { mood: selectedMood, energy: selectedEnergy as Energy, gratitudes, kindPhrase, nextAction, videoWatched: true, audioCompleted: true, completedAt: now } });
        break;
    }
  };

  const handleComplete = () => {
    saveCurrentAnswers();
    completeDay(dayNumber);
    sendAchievement(dayNumber);

    const today = new Date().toISOString().split('T')[0];
    let newStreak = progress.streak;
    if (progress.lastCompletedDate) {
      const lastDate = new Date(progress.lastCompletedDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) newStreak = progress.streak + 1;
      else if (diffDays > 1) newStreak = 1;
    } else {
      newStreak = 1;
    }

    const newCompletedDays = progress.completedDays.includes(dayNumber)
      ? progress.completedDays
      : [...progress.completedDays, dayNumber];

    checkAndTriggerCelebration(newCompletedDays, newStreak, dayNumber, totalDays);
  };

  const handleCelebrationClose = () => {
    closeCelebration();
    navigate(dayNumber === 3 ? '/survey' : '/');
  };

  const getDayTitle = (): string => {
    if (dayContent) return dayContent.title[localeKey];
    return `${t('journey.day')} ${dayNumber}`;
  };

  const getDaySubtitle = (): string => {
    if (dayContent) return dayContent.subtitle[localeKey];
    return '';
  };

  const getDayLabel = (): string => {
    return `${t('journey.day')} ${displayDay}`;
  };

  // Render survey content based on day
  const renderSurveyContent = () => {
    switch (dayNumber) {
      case 0: return renderWelcomeSurvey();
      case 1: return renderDay1Survey();
      case 2: return renderDay2Survey();
      case 3: return renderDay3Survey();
      default: return null;
    }
  };

  const renderWelcomeSurvey = () => (
    <div className="py-4 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2 text-center">
          {t('day.0.checkin')}
        </h2>
        <p className="text-muted-foreground text-center mb-4">
          {locale.startsWith('es')
            ? 'Tu respuesta es solo para ti. No hay respuestas correctas o incorrectas.'
            : 'Your answer is just for you. There are no right or wrong answers.'}
        </p>
        <MoodSelector onSelect={setSelectedMood as any} selectedMood={selectedMood as any} />
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-3 text-center">
          {t('energy.title' as any)}
        </h3>
        <EnergySelector onSelect={setSelectedEnergy} selectedEnergy={selectedEnergy} />
      </div>

      <div className="flex justify-center mt-6">
        <Button onClick={nextStep} disabled={!canProceedFromSurvey()} className="gap-2 rounded-full px-8">
          {t('welcome.block0.ready')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderDay1Survey = () => (
    <div className="py-4">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">{t('day.1.words.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('day.1.words.instruction')}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1, 2].map(i => (
            <Input
              key={i}
              placeholder={locale.startsWith('es')
                ? `${['Primera', 'Segunda', 'Tercera'][i]} palabra`
                : `${['First', 'Second', 'Third'][i]} word`}
              value={words[i]}
              onChange={e => {
                const newWords = [...words] as [string, string, string];
                newWords[i] = e.target.value;
                setWords(newWords);
              }}
              className="text-center"
            />
          ))}

          <div className="border-t border-border/40 pt-4 mt-4">
            <p className="text-lg font-semibold text-foreground mb-3">{t('day.1.timeslot')}</p>
            <RadioGroup value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
              {timeSlotOptions[localeKey].map(option => (
                <div key={option.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={option.value} id={`time-${option.value}`} />
                  <Label htmlFor={`time-${option.value}`} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-4">
        <Button onClick={nextStep} disabled={!canProceedFromSurvey()} className="gap-2 rounded-full px-8">
          {t('survey.submit')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderDay2Survey = () => (
    <div className="py-4">
      {/* PDF reading notice */}
      <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <Download className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
            {locale.startsWith('es') ? 'Antes de continuar, lee el PDF del Día 2' : 'Before continuing, read the Day 2 PDF'}
          </p>
          <p className="text-amber-700 dark:text-amber-400 mb-2">
            {locale.startsWith('es')
              ? 'Primero leer el PDF, para continuar.'
              : 'Read the PDF first, then continue.'}
          </p>
          {dayContents[2]?.pdf.url && (
            <a
              href={dayContents[2].pdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-300 underline underline-offset-2 hover:opacity-80"
            >
              <Download className="h-3.5 w-3.5" />
              {locale.startsWith('es') ? 'Descargar PDF Día 2' : 'Download Day 2 PDF'}
            </a>
          )}
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">{t('day.2.value.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('day.2.value.instruction')}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Value + Timeslot side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium mb-1 block">{locale.startsWith('es') ? 'Tu valor' : 'Your value'}</Label>
              <Input
                placeholder={locale.startsWith('es') ? 'Escribe aquí...' : 'Write here...'}
                value={customValue}
                onChange={e => { setCustomValue(e.target.value); setSelectedValue(''); }}
                className="text-center"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">{t('day.1.timeslot')}</Label>
              <Input
                placeholder={locale.startsWith('es') ? 'Ej: En la mañana...' : 'E.g.: Morning...'}
                value={day2TimeSlot}
                onChange={e => setDay2TimeSlot(e.target.value)}
                className="text-center"
              />
            </div>
          </div>

          {/* Action */}
          <div>
            <Label className="text-sm font-medium mb-1 block">{t('day.2.action.title')}</Label>
            <Textarea
              placeholder={locale.startsWith('es') ? 'Escribe tu acción...' : 'Write your action...'}
              value={day2Action} onChange={e => setDay2Action(e.target.value)} rows={2}
            />
          </div>

          {/* 3 Words in a row */}
          <div>
            <Label className="text-sm font-medium mb-1 block">{t('day.2.words.title')}</Label>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map(i => (
                <Input
                  key={i}
                  placeholder={locale.startsWith('es')
                    ? `${['1ra', '2da', '3ra'][i]} palabra`
                    : `${['1st', '2nd', '3rd'][i]} word`}
                  value={wordsAfter[i]}
                  onChange={e => {
                    const newWords = [...wordsAfter] as [string, string, string];
                    newWords[i] = e.target.value;
                    setWordsAfter(newWords);
                  }}
                  className="text-center"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-4">
        <Button onClick={nextStep} disabled={!canProceedFromSurvey()} className="gap-2 rounded-full px-8">
          {t('survey.submit')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderDay3Survey = () => (
    <div className="py-4">
      <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <Download className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
            {locale.startsWith('es') ? 'Antes de continuar, lee el PDF del Día 3' : 'Before continuing, read the Day 3 PDF'}
          </p>
          <p className="text-amber-700 dark:text-amber-400 mb-2">
            {locale.startsWith('es') ? 'Primero leer el PDF, para continuar.' : 'Read the PDF first, then continue.'}
          </p>
          {dayContents[3]?.pdf.url && (
            <a href={dayContents[3].pdf.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-300 underline underline-offset-2 hover:opacity-80">
              <Download className="h-3.5 w-3.5" />
              {locale.startsWith('es') ? 'Descargar PDF Día 3' : 'Download Day 3 PDF'}
            </a>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[5fr,3fr] gap-4">
        {/* Left column (full width on mobile): exercises */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">{t('day.3.gratitude.title')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('day.3.gratitude.instruction')}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map(i => (
                <Input
                  key={i}
                  placeholder={locale.startsWith('es')
                    ? `${['1ra', '2da', '3ra'][i]} gratitud`
                    : `${['1st', '2nd', '3rd'][i]} gratitude`}
                  value={gratitudes[i]}
                  onChange={e => {
                    const g = [...gratitudes] as [string, string, string];
                    g[i] = e.target.value;
                    setGratitudes(g);
                  }}
                  className="text-center"
                />
              ))}
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">{t('day.3.phrase.title')}</Label>
              <Textarea placeholder={t('day.3.phrase.placeholder')} value={kindPhrase} onChange={e => setKindPhrase(e.target.value)} rows={2} />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">{t('day.3.next.title')}</Label>
              <Textarea placeholder={t('day.3.next.placeholder')} value={nextAction} onChange={e => setNextAction(e.target.value)} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Right column: Mood + Energy stacked */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <h2 className="text-sm font-semibold text-foreground mb-2">{t('survey.title')}</h2>
            <MoodSelector onSelect={setSelectedMood as any} selectedMood={selectedMood as any} showResponse={false} />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold text-foreground mb-2">{t('energy.title' as any)}</h3>
            <EnergySelector onSelect={setSelectedEnergy} selectedEnergy={selectedEnergy} showResponse={false} />
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <Button onClick={nextStep} disabled={!canProceedFromSurvey()} className="gap-2 rounded-full px-8">
          {t('survey.submit')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const getClosureMessage = (): string => {
    const isSpanish = locale.startsWith('es');
    switch (dayNumber) {
      case 0:
        return isSpanish
          ? '¡Completaste el Día 1! Hoy diste tu primer paso. Nos vemos mañana para el Día 2.'
          : 'You completed Day 1! Today you took your first step. See you tomorrow for Day 2.';
      case 2:
        return isSpanish
          ? 'Actuar desde tus valores te conecta contigo. Nos vemos mañana para cerrar este viaje.'
          : 'Acting from your values connects you with yourself. See you tomorrow to close this journey.';
      case 3:
        return isSpanish
          ? '¡Has terminado el reto! Completaste los 3 días. Recuerda: este programa es educativo. Si necesitas apoyo profesional, no dudes en buscarlo.'
          : 'You finished the challenge! You completed all 3 days. Remember: this program is educational. If you need professional support, do not hesitate to seek it.';
      default:
        return '';
    }
  };

  const getNextDayPreview = (): string | null => {
    if (dayNumber >= 3) return null;
    // Day 0 → next visible day is 2 (displayed as "Día 2")
    if (dayNumber === 0) return `${t('closure.nextDay.prefix' as any)}${t('closure.nextDay.day2' as any)}`;
    const nextDay = dayNumber + 1;
    return `${t('closure.nextDay.prefix' as any)}${t(`closure.nextDay.day${nextDay}` as any)}`;
  };

  const getClosureTitle = (): string => {
    if (dayNumber === 3) return t('day.complete.title');
    return t('closure.title');
  };

  // Handle inactivity - save progress and navigate home
  const handleInactivitySaveLater = () => {
    saveCurrentAnswers();
    setShowInactivityModal(false);
    navigate('/');
  };

  const handleInactivityContinue = () => {
    setShowInactivityModal(false);
    resetTimer();
  };

  return (
    <>
      <CelebrationModal
        type={celebration.type}
        isOpen={celebration.isOpen}
        onClose={handleCelebrationClose}
        streakCount={celebration.streakCount}
        dayNumber={celebration.dayNumber}
      />

      <InactivityModal
        isOpen={showInactivityModal}
        onContinue={handleInactivityContinue}
        onSaveLater={handleInactivitySaveLater}
      />

      <div className="min-h-screen bg-background pb-16">
        <Header />

        <main className="container mx-auto px-4 py-2 max-w-4xl">
          <div className="flex items-center justify-between mb-2">
            <Button variant="default" size="sm" onClick={prevStep} className="gap-2 rounded-full px-4 bg-[#10B0C0] hover:bg-[#0e9aaa] text-white">
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
            <span className="text-sm font-medium text-muted-foreground">{getDayLabel()}</span>
          </div>

          {/* StepIndicator only for Days 1-3 which have video/audio/download steps */}
          {dayNumber !== 0 && currentStep !== 'start' && currentStep !== 'closure' && (
            <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
          )}

          {dayNumber === 0 ? (
            /* Day 0: Custom sub-step flow with dual videos and dual surveys */
            <AnimatePresence mode="wait">
              <motion.div
                key={day0Step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {DAY0_SUBSTEPS[day0Step] === 'start' && (
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="mb-8"
                    >
                      <BalticaLogo variant="isotipo" size={160} className="mx-auto" />
                    </motion.div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{getDayTitle()}</h1>
                    <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">{getDaySubtitle()}</p>
                    <Button size="lg" onClick={nextStep} className="gap-2 rounded-full px-8">
                      {t('journey.start')}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}

                {/* Día 1: Bienvenida — video */}
                {DAY0_SUBSTEPS[day0Step] === 'video-welcome' && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1 text-center">
                      {locale.startsWith('es') ? 'Día 1: Bienvenida' : 'Day 1: Welcome'}
                    </h2>
                    <p className="text-muted-foreground text-center mb-2 text-sm">
                      {locale.startsWith('es') ? 'Al reto Báltica de 3 días...' : 'Welcome to the 3-day Báltica challenge...'}
                    </p>
                    <div className="mx-auto" style={{ maxWidth: 'calc((100vh - 22rem) * 1.778)' }}>
                      <VideoPlayer src={day0ExtendedContent.welcomeVideo.url} title={day0ExtendedContent.welcomeVideo.title || ''} duration={day0ExtendedContent.welcomeVideo.duration} />
                    </div>
                    <div className="flex justify-center mt-3">
                      <Button onClick={nextStep} className="gap-2 rounded-full px-8">
                        {t('video.next')}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Encuesta mood/energy */}
                {DAY0_SUBSTEPS[day0Step] === 'survey-before' && renderWelcomeSurvey()}

                {/* Día 1: Introducción — video */}
                {DAY0_SUBSTEPS[day0Step] === 'video-intro' && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1 text-center">
                      {locale.startsWith('es') ? 'Día 1: Introducción' : 'Day 1: Introduction'}
                    </h2>
                    <p className="text-muted-foreground text-center mb-2 text-sm">
                      {locale.startsWith('es') ? 'Cómo será el Reto Báltica y qué vas a encontrar' : 'What the Báltica Challenge looks like and what you will find'}
                    </p>
                    <div className="mx-auto" style={{ maxWidth: 'calc((100vh - 22rem) * 1.778)' }}>
                      <VideoPlayer src={day0ExtendedContent.introVideo.url} title={day0ExtendedContent.introVideo.title || ''} duration={day0ExtendedContent.introVideo.duration} />
                    </div>
                    <div className="flex justify-center mt-3">
                      <Button onClick={nextStep} className="gap-2 rounded-full px-8">
                        {t('video.next')}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Día 1: Grounding — video */}
                {DAY0_SUBSTEPS[day0Step] === 'video-grounding' && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1 text-center">
                      {locale.startsWith('es') ? 'Día 1: Grounding' : 'Day 1: Grounding'}
                    </h2>
                    <p className="text-muted-foreground text-center mb-2 text-sm">
                      {locale.startsWith('es') ? 'Técnica de anclaje para conectar con el presente' : 'Grounding technique to connect with the present'}
                    </p>
                    <div className="mx-auto" style={{ maxWidth: 'calc((100vh - 22rem) * 1.778)' }}>
                      <VideoPlayer src={day1Content.video.url} title={day1Content.video.title || ''} duration={day1Content.video.duration} />
                    </div>
                    <div className="flex justify-center mt-3">
                      <Button onClick={nextStep} className="gap-2 rounded-full px-8">
                        {t('video.next')}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Audio grounding */}
                {DAY0_SUBSTEPS[day0Step] === 'audio-grounding' && (
                  <div className="py-2">
                    <h2 className="text-lg font-semibold text-foreground mb-1 text-center">{t('content.audio')}</h2>
                    <p className="text-muted-foreground text-center mb-2 text-sm">{day1Content.audio.title}</p>
                    <AudioPlayer title={day1Content.audio.title || ''} subtitle={t('audio.title')} duration={day1Content.audio.duration || '5:00'} audioSrc={day1Content.audio.url} />
                    <div className="flex justify-center mt-3">
                      <Button onClick={nextStep} className="gap-2 rounded-full px-8">
                        {t('audio.next')}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* 5 senses exercise (from Day 1) */}
                {DAY0_SUBSTEPS[day0Step] === 'five-senses' && (
                  <div className="py-4">
                    {/* PDF reading notice */}
                    <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <Download className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                          {locale.startsWith('es') ? 'Antes de continuar, lee el PDF del Día 1' : 'Before continuing, read the Day 1 PDF'}
                        </p>
                        <p className="text-amber-700 dark:text-amber-400 mb-2">
                          {locale.startsWith('es') ? 'Primero leer el PDF, para continuar.' : 'Read the PDF first, then continue.'}
                        </p>
                        {day1Content.pdf.url && (
                          <a href={day1Content.pdf.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-300 underline underline-offset-2 hover:opacity-80">
                            <Download className="h-3.5 w-3.5" />
                            {locale.startsWith('es') ? 'Descargar PDF Día 1' : 'Download Day 1 PDF'}
                          </a>
                        )}
                      </div>
                    </div>
                    <Card className="shadow-card">
                      <CardHeader>
                        <CardTitle className="text-lg">{t('day.1.words.title')}</CardTitle>
                        <p className="text-sm text-muted-foreground">{t('day.1.words.instruction')}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[0, 1, 2].map(i => (
                          <Input
                            key={i}
                            placeholder={locale.startsWith('es')
                              ? `${['Primera', 'Segunda', 'Tercera'][i]} palabra`
                              : `${['First', 'Second', 'Third'][i]} word`}
                            value={words[i]}
                            onChange={e => {
                              const newWords = [...words] as [string, string, string];
                              newWords[i] = e.target.value;
                              setWords(newWords);
                            }}
                            className="text-center"
                          />
                        ))}
                        <div className="border-t border-border/40 pt-4 mt-4">
                          <p className="text-lg font-semibold text-foreground mb-3">{t('day.1.timeslot')}</p>
                          <RadioGroup value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                            {timeSlotOptions[localeKey].map(option => (
                              <div key={option.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                                <RadioGroupItem value={option.value} id={`time-${option.value}`} />
                                <Label htmlFor={`time-${option.value}`} className="cursor-pointer">{option.label}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="flex justify-center mt-4">
                      <Button onClick={nextStep} disabled={!words.every(w => w.trim()) || !selectedTimeSlot} className="gap-2 rounded-full px-8">
                        {t('survey.submit')}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Download PDFs */}
                {DAY0_SUBSTEPS[day0Step] === 'download' && (
                  <div className="py-4">
                    <h2 className="text-xl font-semibold text-foreground mb-4 text-center">{t('content.download')}</h2>
                    <div className="space-y-3">
                      <Card className="shadow-card">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                            <Download className="h-5 w-5 text-secondary-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">{day0ExtendedContent.welcomePdf.title}</p>
                            <p className="text-xs text-muted-foreground">{locale.startsWith('es') ? 'Material de bienvenida' : 'Welcome material'}</p>
                          </div>
                          <a href={day0ExtendedContent.welcomePdf.url!} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-1.5">
                              <Download className="h-3.5 w-3.5" />
                              PDF
                            </Button>
                          </a>
                        </CardContent>
                      </Card>
                      {day0ExtendedContent.introPdf?.url && (
                        <Card className="shadow-card">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                              <Download className="h-5 w-5 text-secondary-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground text-sm">{day0ExtendedContent.introPdf.title}</p>
                              <p className="text-xs text-muted-foreground">{locale.startsWith('es') ? 'Material de la introducción' : 'Introduction material'}</p>
                            </div>
                            <a href={day0ExtendedContent.introPdf.url} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="gap-1.5">
                                <Download className="h-3.5 w-3.5" />
                                PDF
                              </Button>
                            </a>
                          </CardContent>
                        </Card>
                      )}
                      {day1Content.pdf.url && (
                        <Card className="shadow-card">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                              <Download className="h-5 w-5 text-secondary-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground text-sm">{day1Content.pdf.title}</p>
                              <p className="text-xs text-muted-foreground">{locale.startsWith('es') ? 'Material de Grounding' : 'Grounding material'}</p>
                            </div>
                            <a href={day1Content.pdf.url} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="gap-1.5">
                                <Download className="h-3.5 w-3.5" />
                                PDF
                              </Button>
                            </a>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    <div className="flex justify-center mt-6">
                      <Button onClick={nextStep} className="gap-2 rounded-full px-8">
                        {t('common.next')}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}


                {DAY0_SUBSTEPS[day0Step] === 'closure' && (
                  <div className="py-4 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="w-16 h-16 rounded-full bg-accent/30 flex items-center justify-center mx-auto mb-3"
                    >
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </motion.div>

                    <h1 className="text-2xl font-bold text-foreground mb-3">{getClosureTitle()}</h1>

                    <Card className="shadow-card mb-4 text-left">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <BalticaLogo variant="isotipo" size={28} />
                          <CardTitle className="text-base">{t('closure.practice.title')}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-foreground mb-2">{getClosureMessage()}</p>
                        {dayContent && (
                          <p className="text-xs text-muted-foreground">{dayContent.practice[localeKey]}</p>
                        )}
                        {getNextDayPreview() && (
                          <div className="mt-2 pt-2 border-t border-border/40">
                            <p className="text-sm font-medium text-primary">{getNextDayPreview()}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="flex justify-center">
                      <Button onClick={handleComplete} size="lg" className="gap-2 rounded-full px-8">
                        {t('closure.next')}
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            /* Days 1-3: Standard step flow */
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 'start' && (
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="mb-8"
                    >
                      <div className="w-24 h-24 rounded-full gradient-warm flex items-center justify-center mx-auto shadow-soft">
                        <span className="text-4xl font-bold text-primary-foreground">{displayDay}</span>
                      </div>
                    </motion.div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{getDayTitle()}</h1>
                    <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">{getDaySubtitle()}</p>
                    <Button size="lg" onClick={nextStep} className="gap-2 rounded-full px-8">
                      {t('journey.start')}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}

                {currentStep === 'video' && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1 text-center">{t('content.video')}</h2>
                    <p className="text-muted-foreground text-center mb-2 text-sm">{dayContent?.video.title || t('video.title')}</p>
                    <div className="mx-auto" style={{ maxWidth: 'calc((100vh - 22rem) * 1.778)' }}>
                      <VideoPlayer src={dayContent?.video.url} title={dayContent?.video.title || ''} duration={dayContent?.video.duration || '1:30'} onComplete={() => markStepComplete('video')} />
                    </div>
                    <div className="flex justify-center mt-3">
                      <Button onClick={nextStep} className="gap-2 rounded-full px-8">
                        {t('video.next')}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'audio' && (
                  <div className="py-2">
                    <h2 className="text-lg font-semibold text-foreground mb-1 text-center">{t('content.audio')}</h2>
                    <p className="text-muted-foreground text-center mb-2 text-sm">{dayContent?.audio.title || t('audio.title')}</p>
                    <AudioPlayer title={dayContent?.audio.title || ''} subtitle={t('audio.title')} duration={dayContent?.audio.duration || '5:00'} audioSrc={dayContent?.audio.url} onComplete={() => markStepComplete('audio')} />
                    <div className="flex justify-center mt-3">
                      <Button onClick={nextStep} className="gap-2 rounded-full px-8">
                        {t('audio.next')}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'download' && (
                  <div className="py-4">
                    <h2 className="text-xl font-semibold text-foreground mb-4 text-center">{t('content.download')}</h2>
                    <Card className="shadow-card">
                      <CardHeader className="text-center pb-2">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                          <Download className="h-6 w-6 text-secondary-foreground" />
                        </div>
                        <CardTitle>{dayContent?.pdf.title || ''}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-muted-foreground mb-4">
                          {locale.startsWith('es') ? 'Prepara tu mente y cuerpo para comenzar a tu propio ritmo' : 'Complementary material for your practice'}
                        </p>
                        {dayContent?.pdf.url && (
                          <a href={dayContent.pdf.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="gap-2">
                              <Download className="h-4 w-4" />
                              {locale.startsWith('es') ? '¡Empezar con calma!' : 'Download PDF'}
                            </Button>
                          </a>
                        )}
                      </CardContent>
                    </Card>
                    <div className="flex justify-center mt-6">
                      <Button onClick={nextStep} className="gap-2 rounded-full px-8">
                        {t('common.next')}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'survey' && renderSurveyContent()}

                {currentStep === 'closure' && (
                  <div className="py-4 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="w-16 h-16 rounded-full bg-accent/30 flex items-center justify-center mx-auto mb-3"
                    >
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </motion.div>

                    <h1 className="text-2xl font-bold text-foreground mb-3">{getClosureTitle()}</h1>

                    {dayNumber === 3 && (
                      <p className="text-muted-foreground mb-3">{t('day.complete.subtitle')}</p>
                    )}

                    <Card className="shadow-card mb-4 text-left">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <BalticaLogo variant="isotipo" size={28} />
                          <CardTitle className="text-base">
                            {dayNumber === 3
                              ? (locale.startsWith('es') ? 'Mensaje final' : 'Final message')
                              : t('closure.practice.title')}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-foreground mb-2">{getClosureMessage()}</p>
                        {dayContent && (
                          <p className="text-xs text-muted-foreground">{dayContent.practice[localeKey]}</p>
                        )}
                        {getNextDayPreview() && (
                          <div className="mt-2 pt-2 border-t border-border/40">
                            <p className="text-sm font-medium text-primary">{getNextDayPreview()}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Before/after emotional comparison for Day 3 */}
                    {dayNumber === 3 && dayAnswers.welcome?.mood && selectedMood && (
                      <Card className="shadow-card mb-4 text-left">
                        <CardContent className="pt-4 pb-4">
                          <p className="text-base font-semibold mb-3">
                            {locale.startsWith('es') ? 'Tu viaje emocional' : 'Your emotional journey'}
                          </p>
                          <div className="flex items-center justify-around">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">
                                {locale.startsWith('es') ? 'Al comenzar' : 'At the start'}
                              </p>
                              <p className="text-base font-medium">{t(`mood.${dayAnswers.welcome.mood}` as any)}</p>
                              {dayAnswers.welcome.energy && (
                                <p className="text-xs text-muted-foreground">{t(`energy.${dayAnswers.welcome.energy}` as any)}</p>
                              )}
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">
                                {locale.startsWith('es') ? 'Al finalizar' : 'At the end'}
                              </p>
                              <p className="text-base font-medium">{t(`mood.${selectedMood}` as any)}</p>
                              {selectedEnergy && (
                                <p className="text-xs text-muted-foreground">{t(`energy.${selectedEnergy}` as any)}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button onClick={() => { handleComplete(); if (dayNumber === 3) navigate('/survey'); }} size="lg" className="gap-2 rounded-full px-8">
                        {dayNumber === 3
                          ? (locale.startsWith('es') ? 'Completar encuesta de satisfacción' : 'Complete satisfaction survey')
                          : t('closure.next')}
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        <FloatingHelp />
        <EthicalFooter />
      </div>
    </>
  );
}
