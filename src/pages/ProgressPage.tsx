import { useApp } from '@/contexts/AppContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Header } from '@/components/layout/Header';
import { ProgressRing } from '@/components/journey/ProgressRing';
import { DayCard } from '@/components/journey/DayCard';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Flame, Calendar, TrendingUp, Smile, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function ProgressPage() {
  const { t, locale, progress, totalDays, dayAnswers } = useApp();
  const navigate = useNavigate();
  usePageTitle('Mi Progreso');

  const isSpanish = locale.startsWith('es');

  // Count only reto days (1–3); Day 0 is "Bienvenida" (setup), not part of the 3-day reto
  // Visible days: [0, 2, 3] displayed as "1", "2", "3" (day 1 merged into day 0)
  const visibleDays = [0, 2, 3];

  // Count completed visible days: day 0 requires both 0+1 done, days 2 and 3 are standalone
  const dia1Complete = progress.completedDays.includes(0) && progress.completedDays.includes(1);
  const dia2Complete = progress.completedDays.includes(2);
  const dia3Complete = progress.completedDays.includes(3);
  const retoDaysCompleted = [dia1Complete, dia2Complete, dia3Complete].filter(Boolean).length;
  const progressPercent = Math.min((retoDaysCompleted / totalDays) * 100, 100);

  const getDayStatus = (day: number): 'completed' | 'current' | 'locked' => {
    if (day === 0) {
      if (dia1Complete) return 'completed';
      if (progress.currentDay <= 1) return 'current';
      return 'locked';
    }
    if (progress.completedDays.includes(day)) return 'completed';
    if (day === progress.currentDay) return 'current';
    return 'locked';
  };

  const energyLabel = (e?: string) => {
    if (!e) return '—';
    if (isSpanish) return e === 'high' ? 'Alta' : e === 'medium' ? 'Media' : e === 'low' ? 'Baja' : e;
    return e === 'high' ? 'High' : e === 'medium' ? 'Medium' : e === 'low' ? 'Low' : e;
  };

  const moodBefore = dayAnswers.welcome?.moodBefore || dayAnswers.welcome?.mood;
  const energyBefore = dayAnswers.welcome?.energyBefore || dayAnswers.welcome?.energy;
  const hasSurveyData = !!(moodBefore || energyBefore || dayAnswers.day3);

  const stats = [
    {
      icon: Calendar,
      value: `${retoDaysCompleted}/${totalDays}`,
      label: isSpanish ? 'Días del reto' : 'Challenge days',
      desc: isSpanish ? 'De los 3 días del programa completados' : 'Of the 3-day program completed',
      color: 'text-primary',
    },
    {
      icon: Flame,
      value: progress.streak,
      label: isSpanish ? 'Racha actual' : 'Current streak',
      desc: isSpanish ? 'Días seguidos que practicaste sin parar' : 'Consecutive days you practiced',
      color: 'text-orange-500',
    },
    {
      icon: TrendingUp,
      value: `${Math.round(progressPercent)}%`,
      label: isSpanish ? 'Progreso total' : 'Total progress',
      desc: isSpanish ? 'Porcentaje del reto de 3 días completado' : 'Percentage of the 3-day challenge done',
      color: 'text-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-4 max-w-4xl">
        <motion.h1
          className="text-xl md:text-2xl font-bold text-foreground mb-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t('progress.title')}
        </motion.h1>

        {/* Ring + Stats */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 mb-4 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex-shrink-0">
            <ProgressRing progress={progressPercent} size={140} strokeWidth={12}>
              <div className="text-center">
                <span className="text-3xl font-bold text-primary">{retoDaysCompleted}</span>
                <span className="text-muted-foreground text-sm block">/ {totalDays} {t('progress.days')}</span>
              </div>
            </ProgressRing>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            {stats.map((stat, i) => (
              <Card key={i} className="shadow-card">
                <CardContent className="p-3 text-center">
                  <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs font-semibold text-foreground leading-tight">{stat.label}</p>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5">{stat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Day cards */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold text-foreground mb-2 text-center">
            {t('progress.yourJourney' as any)}
          </h2>
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            {visibleDays.map(day => (
              <DayCard
                key={day}
                day={day}
                status={getDayStatus(day)}
                onClick={() => getDayStatus(day) !== 'locked' && navigate(`/journey/${day}`)}
              />
            ))}
          </div>
        </motion.div>

        {/* Survey comparison */}
        {hasSurveyData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <h2 className="text-sm font-semibold text-foreground mb-2 text-center">
              {isSpanish ? 'Encuesta: Inicio vs Final' : 'Survey: Start vs End'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Before */}
              <Card className="shadow-card">
                <CardContent className="p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {isSpanish ? 'Al inicio (Día 1)' : 'At start (Day 1)'}
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {moodBefore ? (
                      <div className="flex items-center gap-1.5">
                        <Smile className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-muted-foreground text-xs">{isSpanish ? 'Ánimo:' : 'Mood:'}</span>
                        <span className="font-medium text-foreground text-xs capitalize">{moodBefore}</span>
                      </div>
                    ) : null}
                    {energyBefore ? (
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                        <span className="text-muted-foreground text-xs">{isSpanish ? 'Energía:' : 'Energy:'}</span>
                        <span className="font-medium text-foreground text-xs">{energyLabel(energyBefore)}</span>
                      </div>
                    ) : null}
                    {!moodBefore && !energyBefore && (
                      <p className="text-xs text-muted-foreground italic">{isSpanish ? 'Sin datos' : 'No data'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* After */}
              <Card className="shadow-card">
                <CardContent className="p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {isSpanish ? 'Al final (Día 3)' : 'At end (Day 3)'}
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {dayAnswers.day3?.mood ? (
                      <div className="flex items-center gap-1.5">
                        <Smile className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-muted-foreground text-xs">{isSpanish ? 'Ánimo:' : 'Mood:'}</span>
                        <span className="font-medium text-foreground text-xs capitalize">{dayAnswers.day3.mood}</span>
                      </div>
                    ) : null}
                    {dayAnswers.day3?.energy ? (
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                        <span className="text-muted-foreground text-xs">{isSpanish ? 'Energía:' : 'Energy:'}</span>
                        <span className="font-medium text-foreground text-xs">{energyLabel(dayAnswers.day3.energy)}</span>
                      </div>
                    ) : null}
                    {dayAnswers.day3?.gratitudes?.some(g => g.trim()) && (
                      <div className="pt-1 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-1">{isSpanish ? 'Gratitudes:' : 'Gratitudes:'}</p>
                        <ul className="space-y-0.5">
                          {dayAnswers.day3.gratitudes.filter(g => g.trim()).map((g, i) => (
                            <li key={i} className="text-xs text-foreground flex items-start gap-1">
                              <span className="text-primary font-bold shrink-0">{i + 1}.</span> {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {dayAnswers.day3?.kindPhrase && (
                      <p className="text-xs text-foreground italic border-t border-border pt-1 line-clamp-2">
                        "{dayAnswers.day3.kindPhrase}"
                      </p>
                    )}
                    {!dayAnswers.day3 && (
                      <p className="text-xs text-muted-foreground italic">{isSpanish ? 'Aún no completado' : 'Not completed yet'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Achievement */}
        {retoDaysCompleted >= totalDays && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                  <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">
                    {isSpanish ? '¡Reto completado!' : 'Challenge complete!'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isSpanish ? 'Has demostrado compromiso con tu bienestar' : 'You have shown commitment to your well-being'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
