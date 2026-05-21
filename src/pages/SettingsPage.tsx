import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { EthicalNote } from '@/components/EthicalNote';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { locales } from '@/lib/i18n';
import {
  User,
  Bell,
  Palette,
  FileText,
  Lock,
  Mail,
  Smartphone,
  MessageCircle,
  Sun,
  Moon,
  Monitor,
  Clock,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

export default function SettingsPage() {
  const { t, locale, setLocale, theme, setTheme, userName, setUserName, userEmail, userRole, logout } = useApp();
  const { settings, updateSettings } = useNotificationContext();
  const navigate = useNavigate();
  usePageTitle('Configuración');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/landing');
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError(locale.startsWith('es') ? 'La contraseña debe tener al menos 8 caracteres' : 'Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(locale.startsWith('es') ? 'Las contraseñas no coinciden' : 'Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.error || (locale.startsWith('es') ? 'Error al cambiar contraseña' : 'Error changing password'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const themeOptions = [
    { value: 'light', label: t('settings.theme.light'), icon: Sun },
    { value: 'dark', label: t('settings.theme.dark'), icon: Moon },
    { value: 'system', label: t('settings.theme.system'), icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="mb-4">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 rounded-full px-4 bg-[#10B0C0] hover:bg-[#0e9aaa] text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale.startsWith('es') ? 'Volver' : 'Back'}
          </Button>
        </div>

        <motion.h1
          className="text-2xl md:text-3xl font-bold text-foreground mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t('settings.title')}
        </motion.h1>

        <div className="space-y-6">
          {/* Account Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  {t('settings.account')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('settings.account.name')}</Label>
                  <Input
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('settings.account.email')}</Label>
                  <Input value={userEmail || 'usuario@ejemplo.com'} disabled className="bg-muted" />
                </div>

              </CardContent>
            </Card>
          </motion.div>

          {/* Security Section - Password Change */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5" />
                  {locale.startsWith('es') ? 'Seguridad' : 'Security'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    {locale.startsWith('es') ? 'Contraseña actual' : 'Current password'}
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    {locale.startsWith('es') ? 'Nueva contraseña' : 'New password'}
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {locale.startsWith('es') ? 'Confirmar contraseña' : 'Confirm password'}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {passwordError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                {passwordSuccess && (
                  <Alert className="border-green-500 text-green-700 dark:text-green-400">
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      {locale.startsWith('es') ? 'Contraseña actualizada correctamente' : 'Password updated successfully'}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleChangePassword}
                  disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {passwordLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {locale.startsWith('es') ? 'Cambiar contraseña' : 'Change password'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reminders Section - hidden for admin */}
          {userRole !== 'admin' && <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5" />
                  {t('settings.reminders')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.reminders.daily')}</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe un recordatorio diario
                    </p>
                  </div>
                  <Switch
                    checked={settings.dailyReminder}
                    onCheckedChange={(checked) => updateSettings({ dailyReminder: checked })}
                  />
                </div>

                {settings.dailyReminder && (
                  <div className="flex items-center gap-4">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t('settings.reminders.time')}
                    </Label>
                    <Input
                      type="time"
                      value={settings.reminderTime}
                      onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                      className="w-32"
                    />
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <Label>{t('settings.reminders.channel')}</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{t('settings.reminders.email')}</span>
                      </div>
                      <Badge variant="secondary">Activo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span>{t('settings.reminders.push')}</span>
                      </div>
                      <Badge variant="outline">Próximamente</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span>{t('settings.reminders.whatsapp')}</span>
                      </div>
                      <Badge variant="outline">Próximamente</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>}

          {/* Appearance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="h-5 w-5" />
                  {t('settings.appearance')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('settings.language')}</Label>
                  <Select value={locale} onValueChange={(value: any) => setLocale(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locales.map((loc) => (
                        <SelectItem key={loc.code} value={loc.code}>
                          <span className="flex items-center gap-2">
                            <span>{loc.flag}</span>
                            <span>{loc.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('settings.theme')}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Button
                          key={option.value}
                          variant={theme === option.value ? 'default' : 'outline'}
                          className="flex-col h-auto py-3 gap-2"
                          onClick={() => setTheme(option.value as any)}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs">{option.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Legal Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  {t('settings.legal')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/activity-log">
                  <Button variant="ghost" className="w-full justify-between">
                    {t('nav.activityLog')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/terms">
                  <Button variant="ghost" className="w-full justify-between">
                    {t('settings.legal.terms')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/privacy">
                  <Button variant="ghost" className="w-full justify-between">
                    {t('settings.legal.privacy')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ethical Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <EthicalNote variant="inline" />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
