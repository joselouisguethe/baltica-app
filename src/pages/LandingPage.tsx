import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowDown, Globe, Moon, Sun, Check, Focus, Target, Heart, Brain, Briefcase, Smartphone, HeartHandshake, Star, StarHalf, Quote, Play, Menu, X, CreditCard, Zap, Crown, } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import BalticaLogo from '@/components/brand/BalticaLogo';
import { EthicalNote } from '@/components/EthicalNote';
import { locales } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const { t, locale, setLocale, theme, setTheme } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  usePageTitle('Reto de 3 Días de Bienestar y Gestión del Estrés | Metodología Báltica');
  const es = locale.startsWith('es');

  const goToRegister = () => {
    setMobileMenuOpen(false);
    navigate('/auth?mode=register');
  };

  const goToLogin = () => {
    setMobileMenuOpen(false);
    navigate('/auth?mode=login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-32 items-center justify-between px-4">
          <Link to="/" className="flex items-center mt-10">
            {/* Light mode logo */}
            <span className="dark:hidden">
              <BalticaLogo variant="header" size={96} />
            </span>
            {/* Dark mode logo, larger */}
            <span className="hidden dark:block">
              <BalticaLogo variant="header" size={96} />
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {/* Language toggle — always visible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 mx-1 sm:mx-2">
                  <Globe className="h-5 w-5" />
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
                    <p className='w-full text-center'>{loc.label}</p>                    
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle — always visible */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 mx-1 sm:mx-2"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Login button — always visible */}
            <Button variant="ghost" size="sm" onClick={goToLogin}>
              {t('auth.login.cta')}
            </Button>

            {/* Big CTA — visible on md+ only */}
            <Button size="sm" onClick={goToRegister} className="hidden md:inline-flex">
              {t('landing.cta')}
            </Button>

            {/* Hamburger — mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile collapse panel — only visible on mobile when opened */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background px-4 py-4">
            <Button
              size="lg"
              className="w-full gap-2 px-6 py-4 text-sm font-semibold rounded-full shadow-soft whitespace-normal text-center leading-tight"
              onClick={goToRegister}
            >
              {t('landing.cta')}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Button>
          </div>
        )}
      </header>

      {/* ===== SECTION 1: HERO (text only, full width) ===== */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span
            className="inline-block text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mb-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t('landing.pretitle' as any)}
          </motion.span>

          <motion.h1
            className="mb-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="block text-3xl md:text-4xl lg:text-6xl font-bold text-primary leading-tight mb-2">
              {t('landing.headline1' as any)}
            </span>
            <span className="block text-xl md:text-2xl lg:text-4xl font-medium text-foreground leading-snug">
              {t('landing.headline2' as any)}
            </span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t('landing.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* ===== VIDEO SECTION + CTA ===== */}
      <section className="pb-10 md:pb-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="rounded-2xl overflow-hidden shadow-soft"
          >
            <video
              src="/Video 30 seg HORIZONTAL LP.mp4"
              className="w-full h-auto block"
              autoPlay
              muted
              loop
              playsInline
              controls
            />
          </motion.div>

          {/* CTA below video */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Button
              size="lg"
              className="gap-2 px-8 py-6 text-base font-semibold rounded-full shadow-soft"
              onClick={goToRegister}
            >
              {t('landing.cta')}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              {t('landing.microcopy' as any)}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 2: EL PROBLEMA ===== */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t('landing.problem.title' as any)}
          </motion.h2>

          <motion.p
            className="text-muted-foreground text-center mb-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t('landing.problem.intro' as any)}
          </motion.p>

          <motion.p
            className="text-base font-medium text-foreground text-center mb-8"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t('landing.problem.intro2' as any)}
          </motion.p>

          <div className="space-y-4 mb-10">
            {[1, 2, 3, 4, 5].map((i, idx) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border/40"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-base text-foreground leading-relaxed">
                  {t(`landing.problem.point${i}` as any)}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center bg-primary/10 dark:bg-primary/20 rounded-2xl py-6 px-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <p className="text-xl md:text-2xl font-semibold text-primary mb-4">
              {t('landing.problem.transition' as any)}
            </p>
            <ArrowDown className="h-6 w-6 text-primary mx-auto animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 3: LA SOLUCIÓN ===== */}
      <section>
        {/* Brand color stripes */}
        <motion.div
          className="bg-baltica-turquoise py-6 md:py-8 text-center"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white px-4">
            {t('landing.solution.title' as any)}
          </h2>
        </motion.div>
        <motion.div
          className="bg-[hsl(var(--baltica-blue-mid))] py-5 md:py-6 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto px-4 leading-relaxed">
            {t('landing.solution.intro' as any)}
          </p>
        </motion.div>

        <div className="container mx-auto px-4 max-w-6xl pt-12 pb-16 md:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Focus, day: 1, label: 'DÍA 1', titleKey: 'landing.solution.day1.title', descKey: 'landing.solution.day1.desc' },
              { icon: Target, day: 2, label: 'DÍA 2', titleKey: 'landing.solution.day2.title', descKey: 'landing.solution.day2.desc' },
              { icon: Heart, day: 3, label: 'DÍA 3', titleKey: 'landing.solution.day3.title', descKey: 'landing.solution.day3.desc' },
            ].map((item, i) => (
              <motion.div
                key={item.day}
                className="text-center p-6 rounded-2xl bg-card border border-border/40 shadow-card"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.15, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-semibold tracking-wider uppercase text-primary mb-2 block">
                  {item.label}
                </span>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t(item.titleKey as any)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(item.descKey as any)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: FORMATO ===== */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-foreground mb-12 text-center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t('landing.format.title' as any)}
          </motion.h2>

          {/* Concatenated vertical flow */}
          <div className="space-y-0">
            {[
              { key: '3days', accent: 'border-l-baltica-turquoise', dot: 'bg-baltica-turquoise' },
              { key: '10min', accent: 'border-l-[hsl(var(--baltica-blue-mid))]', dot: 'bg-[hsl(var(--baltica-blue-mid))]' },
              { key: 'sequence', accent: 'border-l-baltica-navy', dot: 'bg-baltica-navy' },
              { key: 'pace', accent: 'border-l-primary', dot: 'bg-primary' },
            ].map((item, index) => (
              <motion.div
                key={item.key}
                className={`border-l-4 ${item.accent} pl-6 md:pl-8 py-6 md:py-8 relative`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.15, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Connector dot */}
                <div className={`absolute -left-[11px] top-8 w-[18px] h-[18px] rounded-full ${item.dot} border-4 border-background`} />

                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {t(`landing.format.${item.key}.number` as any)}
                </h3>
                <p className="text-base md:text-lg font-semibold text-primary mb-3">
                  {t(`landing.format.${item.key}.subtitle` as any)}
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {t(`landing.format.${item.key}.desc` as any)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Mantra */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.6, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <p className="text-3xl md:text-4xl font-bold text-primary tracking-wide">
              {t('landing.format.mantra' as any)}
            </p>
            {/* Testimonials box under Mantra */}
            <div className="mt-8 bg-white/80 dark:bg-card border border-border/30 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-center items-stretch shadow-soft">
              {/* Testimonial 1 */}
              <div className="flex-1 flex flex-col items-center text-center max-w-xs mx-auto">
                <div className="flex gap-0.5 mb-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm md:text-base text-foreground italic mb-2">"Pensé que sería otro contenido más, pero el primer ejercicio ya me hizo sentir diferente."</p>
                <div className="text-xs font-bold text-muted-foreground mb-1">— Daniel M.</div>
                <div className="text-xs font-bold text-muted-foreground">Bogotá (Cundinamarca)</div>
              </div>
              {/* Testimonial 2 */}
              <div className="flex-1 flex flex-col items-center text-center max-w-xs mx-auto">
                <div className="flex gap-0.5 mb-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm md:text-base text-foreground italic mb-2">"Logré eliminar varios malos hábitos frente a redes sociales y uso del celular."</p>
                <div className="text-xs font-bold text-muted-foreground mb-1">— Gloria M.</div>
                <div className="text-xs font-bold text-muted-foreground">Pereira (Risaralda)</div>
              </div>
              {/* Testimonial 3 */}
              <div className="flex-1 flex flex-col items-center text-center max-w-xs mx-auto">
                <div className="flex gap-0.5 mb-2 justify-center">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                  <StarHalf className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
                <p className="text-sm md:text-base text-foreground italic mb-2">"Pensé que necesitaría mucho tiempo, pero en menos de 10 minutos al día ya sentía cambios."</p>
                <div className="text-xs font-bold text-muted-foreground mb-1">— Héctor H.</div>
                <div className="text-xs font-bold text-muted-foreground">Pereira (Risaralda)</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 5: MICROHÁBITOS ===== */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hook */}
          <motion.div
            className="text-center mb-8 space-y-2"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-lg md:text-xl font-semibold text-primary">
              {t('landing.microhabits.hook' as any)}
            </p>
            <p className="text-base text-muted-foreground italic">
              {t('landing.microhabits.hook2' as any)}
            </p>
          </motion.div>

          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto mb-4">
              {t('landing.microhabits.intro' as any)}
            </p>
            <p className="text-sm md:text-base text-foreground font-medium text-center mb-10">
              {t('landing.microhabits.sample' as any)}
            </p>
          </motion.div>

          {/* 4 Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[
              { key: 'cat1', icon: Brain, color: 'text-baltica-turquoise', border: 'border-t-baltica-turquoise' },
              { key: 'cat2', icon: Briefcase, color: 'text-[hsl(var(--baltica-blue-mid))]', border: 'border-t-[hsl(var(--baltica-blue-mid))]' },
              { key: 'cat3', icon: Smartphone, color: 'text-baltica-navy dark:text-blue-300', border: 'border-t-baltica-navy' },
              { key: 'cat4', icon: HeartHandshake, color: 'text-primary', border: 'border-t-primary' },
            ].map((cat, catIndex) => (
              <motion.div
                key={cat.key}
                className={`bg-card rounded-2xl border border-border/40 border-t-4 ${cat.border} shadow-card p-6`}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: catIndex * 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <cat.icon className={`w-6 h-6 ${cat.color}`} />
                  <h3 className="text-base font-bold text-foreground">
                    {t(`landing.microhabits.${cat.key}.title` as any)}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cat.color}`} />
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        {t(`landing.microhabits.${cat.key}.item${i}` as any)}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Closing */}
          <motion.p
            className="text-center text-lg md:text-xl font-bold text-primary"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {t('landing.microhabits.closing' as any)}
          </motion.p>
          {/* Testimonials box under Closing */}
          <div className="mt-8 bg-white/80 dark:bg-card border border-border/30 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-center items-stretch shadow-soft">
            {/* Testimonial 1 */}
            <div className="flex-1 flex flex-col items-center text-center max-w-xs mx-auto">
              <div className="flex gap-0.5 mb-2 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm md:text-base text-foreground italic mb-2">"Antes me sentía constantemente estresado. Después de hacer el reto logré encontrar momentos de calma que no tenía hace mucho tiempo."</p>
              <div className="text-xs font-bold text-muted-foreground mb-1">— Mauricio L., Cali (Valle)</div>
            </div>
            {/* Testimonial 2 */}
            <div className="flex-1 flex flex-col items-center text-center max-w-xs mx-auto">
              <div className="flex gap-0.5 mb-2 justify-center">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
                <StarHalf className="h-5 w-5 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-sm md:text-base text-foreground italic mb-2">"En menos de 10 minutos al día logré sentir más calma mental."</p>
              <div className="text-xs font-bold text-muted-foreground mb-1">Laura M,  — Bogotá D.C.</div>
            </div>
            {/* Testimonial 3 */}
            <div className="flex-1 flex flex-col items-center text-center max-w-xs mx-auto">
              <div className="flex gap-0.5 mb-2 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm md:text-base text-foreground italic mb-2">"Las masterclass son excelentes y son el complemento perfecto para seguir practicando"</p>
              <div className="text-xs font-bold text-muted-foreground mb-1">Mariale S. Bogotá D.C.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      {/* <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
          >
            {locale.startsWith('es') ? 'Lo que dicen quienes ya lo hicieron' : 'What people who did it say'}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { quote: 'Pensé que sería otro contenido más, pero el primer ejercicio ya me hizo sentir diferente.', author: 'Daniel M.', location: 'Bogotá (Cundinamarca)', stars: 5 },
              { quote: 'Logré eliminar varios malos hábitos frente a redes sociales y uso del celular.', author: 'Gloria M.', location: 'Pereira (Risaralda)', stars: 5 },
              { quote: 'Pensé que necesitaría mucho tiempo, pero en menos de 10 minutos al día ya sentía cambios.', author: 'Héctor H.', location: 'Pereira (Risaralda)', stars: 4.5 },
              { quote: 'Antes me sentía constantemente estresado. Después de hacer el reto logré encontrar momentos de calma que no tenía hace mucho tiempo.', author: 'Mauricio L.', location: 'Cali (Valle)', stars: 5 },
              { quote: 'En menos de 10 minutos al día logré sentir más calma mental.', author: 'Laura M.', location: 'Bogotá D.C.', stars: 4.5 },
              { quote: 'Las masterclass son excelentes y son el complemento perfecto para seguir practicando.', author: 'Mariale S.', location: 'Bogotá D.C.', stars: 5 },
              { quote: 'Hace meses sentía que mi mente estaba saturada por el trabajo. Encontré este reto casi por casualidad y decidí probarlo. Los ejercicios son simples, pero efectivos. Después de hacerlo sentí más claridad mental y tranquilidad. Lo recomiendo a cualquiera que necesite reconectar consigo mismo.', author: 'Vanesa R.', location: 'Cali (Valle)', stars: 5 },
              { quote: 'Muy fácil de seguir. Vale completamente la pena.', author: 'Julio C.', location: 'Pereira (Risaralda)', stars: 5 },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="p-5 rounded-2xl bg-card border border-border/40 shadow-card flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Quote className="h-5 w-5 text-primary/40 mb-2 rotate-180" />
                <p className="text-sm text-foreground leading-relaxed italic flex-1 mb-3">
                  "{item.quote}"
                </p>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: Math.floor(item.stars) }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  {item.stars % 1 !== 0 && <StarHalf className="h-4 w-4 fill-amber-400 text-amber-400" />}
                </div>
                <p className="text-sm font-semibold text-foreground">— {item.author}</p>
                <p className="text-xs text-muted-foreground">{item.location}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ===== VIDEO CORTO (placeholder — pending from client) ===== */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            className="aspect-video rounded-2xl bg-card border-2 border-dashed border-border/60 flex flex-col items-center justify-center text-muted-foreground"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
          >
            <video
              src="/La_Reto_Baltica.mp4​​"
              className="w-full h-auto block rounded-2xl"
              autoPlay
              muted
              loop
              playsInline
              controls
            />
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 6: AUTORIDAD Y RESPALDO CIENTÍFICO ===== */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t('landing.authority.title' as any)}
          </motion.h2>

          {/* 3 Scientific Points */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: 'point1', icon: Brain, color: 'text-baltica-turquoise', bg: 'bg-baltica-turquoise/10', border: 'border-baltica-turquoise/30' },
              { key: 'point2', icon: Heart, color: 'text-[hsl(var(--baltica-blue-mid))]', bg: 'bg-[hsl(var(--baltica-blue-mid))]/10', border: 'border-[hsl(var(--baltica-blue-mid))]/30' },
              { key: 'point3', icon: Target, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
            ].map((point, index) => (
              <motion.div
                key={point.key}
                className={`p-6 rounded-2xl ${point.bg} border ${point.border} text-center`}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.25 + index * 0.15, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className={`w-12 h-12 rounded-full ${point.bg} flex items-center justify-center mx-auto mb-4`}>
                  <point.icon className={`w-6 h-6 ${point.color}`} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  {t(`landing.authority.${point.key}.title` as any)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`landing.authority.${point.key}.desc` as any)}
                </p>
              </motion.div>
            ))}
          </div>
          {/* Testimonial after scientific points */}
          <div className="mt-8 bg-white/80 dark:bg-card border border-border/30 rounded-2xl p-6 max-w-2xl mx-auto flex flex-col items-center text-center shadow-soft">
            <div className="flex gap-0.5 mb-2 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-base md:text-lg text-foreground italic mb-2 whitespace-pre-line">
              {`Hace meses sentía que mi mente estaba saturada por el trabajo.\nEncontré este reto casi por casualidad y decidí probarlo.\nLos ejercicios son simples, pero efectivos.\nDespués de hacerlo sentí más claridad mental y tranquilidad.\nLo recomiendo a cualquiera que necesite reconectar consigo mismo.`}
            </p>
            <div className="text-xs font-bold text-muted-foreground mb-1">— Vanesa R., Cali (Valle)</div>
 
          </div>
        </div>
      </section>

      {/* ===== SECTION 7: CIERRE Y CTA FINAL ===== */}
      <section className="py-16 md:py-24 bg-baltica-navy text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.h2
            className="text-2xl md:text-3xl font-bold mb-6 text-center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t('landing.offer.title' as any)}
          </motion.h2>

          <motion.p
            className="text-base md:text-lg text-white/85 leading-relaxed mb-10 text-center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t('landing.offer.body' as any)}
          </motion.p>

          {/* 3 Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                id: 'basico',
                icon: Zap,
                name: 'Plan Básico',
                duration: '1 mes',
                regular: '$80.000',
                launch: '$45.000',
                promo: null,
                features: [
                ],
                highlight: false,
              },
              {
                id: 'intermedio',
                icon: Star,
                name: 'Plan Intermedio',
                duration: '',
                regular: '$320.000',
                launch: '$90.000',
                promo: '4 meses',
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
                regular: '$640.000',
                launch: '$120.000',
                promo: '8 meses',
                features: [
                  'El código del hábito (Master Class)',
                  'De la intención a la acción (50 micro-acciones …)',
                  '60% desc. Próximo Curso',
                ],
                highlight: true,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col ${plan.highlight ? 'bg-primary/20 border-2 border-primary ring-2 ring-primary/30' : 'bg-white/5 border border-white/10'}`}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
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
                        <span className="text-4xl font-bold text-foreground">{plan.launch}</span>
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
                            <span className={isSpecial ? 'text-lg font-bold' : ''}>{feature}</span>
                          </li>
                        )
                      })}
                    </ul>
  
                    <Button
                      className={`w-full rounded-full font-semibold gap-2 ${plan.highlight ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-white/15 hover:bg-white/25 text-white border border-white/30'}`}
                      onClick={goToRegister}
                    >
                      {locale.startsWith('es') ? 'Elegir plan' : 'Choose plan'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Button
              size="lg"
              className="gap-2 px-10 py-6 text-base font-semibold rounded-full shadow-soft bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={goToRegister}
            >
              {t('landing.cta')}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-0">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center gap-6">
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/help" className="hover:text-foreground transition-colors">
                {t('nav.help')}
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="hover:text-foreground transition-colors">
                    {t('ethical.title')}
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <EthicalNote variant="card" />
                </DialogContent>
              </Dialog>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                {t('settings.legal.terms')}
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                {t('settings.legal.privacy')}
              </Link>
            </nav>
            <div className="w-12 h-px bg-border/60" />
            <p className="text-xs text-muted-foreground/60">
              &copy; {new Date().getFullYear()} Báltica Education. {locale.startsWith('es') ? 'Todos los derechos reservados.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
