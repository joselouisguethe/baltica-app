import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { achievements } from '@/config/content';
import { Trophy, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import BalticaLogo from '@/components/brand/BalticaLogo';

export default function AchievementsPage() {
  const { t, progress, locale } = useApp();

  const unlockedCount = achievements.filter((a) =>
    a.condition({ completedDays: progress.completedDays, streak: progress.streak })
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <BalticaLogo variant="isotipo" size={80} className="mx-auto mb-4" />
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {t('achievements.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {unlockedCount} {t('achievements.subtitle')} de {achievements.length}
          </p>
        </motion.div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement, i) => {
            const isUnlocked = achievement.condition({
              completedDays: progress.completedDays,
              streak: progress.streak,
            });

            const title = achievement.title[locale as keyof typeof achievement.title] || achievement.title['es-LATAM'];
            const description = achievement.description[locale as keyof typeof achievement.description] || achievement.description['es-LATAM'];

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Card
                  className={`shadow-card transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800'
                      : 'opacity-60'
                  }`}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                        isUnlocked
                          ? 'bg-amber-100 dark:bg-amber-900/50'
                          : 'bg-muted'
                      }`}
                    >
                      {isUnlocked ? (
                        <span className="text-xl">{achievement.icon}</span>
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {title}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      {isUnlocked ? description : t('achievements.locked')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Motivational Message */}
        {unlockedCount < achievements.length && (
          <motion.div
            className="mt-8 p-6 bg-accent/30 rounded-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-muted-foreground">
              {unlockedCount === 0
                ? 'Comienza tu viaje para desbloquear logros'
                : `¡Sigue así! Te faltan ${achievements.length - unlockedCount} logros`}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
