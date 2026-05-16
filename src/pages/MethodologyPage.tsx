import { useApp } from '@/contexts/AppContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Globe, Moon, Sun, Brain, Timer, Music, ListOrdered, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import BalticaLogo from '@/components/brand/BalticaLogo';
import { locales } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function MethodologyPage() {
  const { t, locale, setLocale, theme, setTheme } = useApp();
  const navigate = useNavigate();
  usePageTitle('Metodología');

  const sections = [
    {
      icon: Brain,
      title: t('methodology.why3days.title' as any),
      content: t('methodology.why3days.content' as any),
    },
    {
      icon: Timer,
      title: t('methodology.why10min.title' as any),
      content: t('methodology.why10min.content' as any),
    },
    {
      icon: Music,
      title: t('methodology.whySound.title' as any),
      content: t('methodology.whySound.content' as any),
    },
    {
      icon: ListOrdered,
      title: t('methodology.whyOrder.title' as any),
      content: t('methodology.whyOrder.content' as any),
    },
    {
      icon: Sparkles,
      title: t('methodology.whatIsACT.title' as any),
      content: t('methodology.whatIsACT.content' as any),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/landing')}
            className="gap-2 rounded-full px-4 bg-[#10B0C0] hover:bg-[#0e9aaa] text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>

          <Link to="/landing" className="absolute left-1/2 -translate-x-1/2">
            <BalticaLogo variant="header" size={56} />
          </Link>

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {locales.map(loc => (
                  <DropdownMenuItem
                    key={loc.code}
                    onClick={() => setLocale(loc.code)}
                    className={cn(locale === loc.code && 'bg-accent')}
                  >
                    <span className="mr-2">{loc.flag}</span>
                    {loc.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('methodology.title' as any)}
            </h1>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
              >
                <Card className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <section.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground mb-2">
                          {section.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Disclaimer */}
          <motion.div
            className="mt-12 p-6 bg-muted/50 rounded-2xl text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-muted-foreground">
              {t('methodology.disclaimer' as any)}
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              size="lg"
              className="rounded-full px-8"
              onClick={() => navigate('/auth?mode=register')}
            >
              {t('landing.cta')}
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
