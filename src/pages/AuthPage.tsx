import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, Lock, User, AlertCircle } from 'lucide-react';
import BalticaLogo from '@/components/brand/BalticaLogo';
import { motion } from 'framer-motion';
import { Globe, Moon, Sun } from 'lucide-react';
import { locales } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, login, locale, setLocale, theme, setTheme } = useApp();
  const { addLog } = useAdmin();
  usePageTitle('Iniciar Sesión');

  const defaultTab = searchParams.get('mode') === 'login' ? 'login' : 'register';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError(t('auth.error.email'));
      return;
    }

    if (password.length < 8) {
      setError(t('auth.error.password'));
      return;
    }

    if (!acceptTerms) {
      setError(t('auth.error.terms' as any));
      return;
    }

    setIsLoading(true);

    const result = await login(email, password, name, true);
    setIsLoading(false);

    if (result.success) {
      navigate('/onboarding');
    } else {
      setError(result.error || t('auth.error.email'));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError(t('auth.error.email'));
      return;
    }

    if (password.length < 8) {
      setError(t('auth.error.password'));
      return;
    }

    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      const role = localStorage.getItem('userRole');
      const userId = localStorage.getItem('userId') || '';
      addLog({
        userId,
        userEmail: email,
        eventType: 'user_login',
        eventDetail: 'user_login',
      });
      navigate(role === 'admin' ? '/admin' : '/');
    } else {
      setError(result.error || t('auth.error.email'));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/80">
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
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <BalticaLogo variant="full" size={120} className="mx-auto drop-shadow-lg" />
          </div>

          {/* Auth Card */}
          <Card className="shadow-card">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="register">{t('auth.tabs.register' as any)}</TabsTrigger>
                  <TabsTrigger value="login">{t('auth.tabs.login' as any)}</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Register Tab */}
                <TabsContent value="register" className="mt-0">
                  <div className="text-center mb-6">
                    <CardTitle className="text-xl">{t('auth.register.title')}</CardTitle>
                    <CardDescription>{t('auth.register.subtitle')}</CardDescription>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('auth.register.name')}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder={t('auth.register.name')}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email-register">{t('auth.register.email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email-register"
                          type="email"
                          placeholder={t('auth.register.email')}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-register">{t('auth.register.password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password-register"
                          type="password"
                          placeholder={t('auth.register.password')}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-muted-foreground leading-tight cursor-pointer"
                      >
                        {t('auth.register.terms')}
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-full"
                      disabled={isLoading}
                    >
                      {isLoading ? t('auth.register.creating' as any) : t('auth.register.cta')}
                    </Button>
                  </form>
                </TabsContent>

                {/* Login Tab */}
                <TabsContent value="login" className="mt-0">
                  <div className="text-center mb-6">
                    <CardTitle className="text-xl">{t('auth.login.title')}</CardTitle>
                    <CardDescription>{t('auth.login.subtitle')}</CardDescription>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-login">{t('auth.register.email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email-login"
                          type="email"
                          placeholder={t('auth.register.email')}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-login">{t('auth.register.password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password-login"
                          type="password"
                          placeholder={t('auth.register.password')}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-full"
                      disabled={isLoading}
                    >
                      {isLoading ? t('auth.login.signingIn' as any) : t('auth.login.cta')}
                    </Button>

                    <div className="text-center">
                      <Button variant="link" className="text-sm text-muted-foreground">
                        {t('auth.login.forgot')}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
