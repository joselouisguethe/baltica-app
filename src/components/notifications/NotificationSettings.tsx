import { Bell, BellRing, Clock, Flame, Heart, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { NotificationSettings as NotificationSettingsType } from '@/hooks/useNotifications';

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  onUpdateSettings: (settings: Partial<NotificationSettingsType>) => void;
  permissionStatus: NotificationPermission;
  onRequestPermission: () => Promise<boolean>;
}

export function NotificationSettings({
  settings,
  onUpdateSettings,
  permissionStatus,
  onRequestPermission,
}: NotificationSettingsProps) {
  const { t } = useApp();

  const handleEnableNotifications = async () => {
    if (permissionStatus === 'default') {
      const granted = await onRequestPermission();
      if (granted) {
        onUpdateSettings({ enabled: true });
      }
    } else {
      onUpdateSettings({ enabled: !settings.enabled });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('notifications.settings.title')}
          </DialogTitle>
          <DialogDescription>
            {t('notifications.settings.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Master toggle */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <BellRing className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="notifications-enabled" className="font-medium">
                      {t('notifications.settings.enable')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {permissionStatus === 'denied'
                        ? t('notifications.settings.blocked')
                        : t('notifications.settings.enableDesc')}
                    </p>
                  </div>
                </div>
                <Switch
                  id="notifications-enabled"
                  checked={settings.enabled && permissionStatus !== 'denied'}
                  onCheckedChange={handleEnableNotifications}
                  disabled={permissionStatus === 'denied'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Reminder time */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('notifications.settings.dailyReminder')}
              </CardTitle>
              <CardDescription>
                {t('notifications.settings.dailyReminderDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-reminder">{t('notifications.settings.reminderEnabled')}</Label>
                <Switch
                  id="daily-reminder"
                  checked={settings.dailyReminder}
                  onCheckedChange={(checked) => onUpdateSettings({ dailyReminder: checked })}
                  disabled={!settings.enabled}
                />
              </div>
              {settings.dailyReminder && (
                <div className="flex items-center gap-3">
                  <Label htmlFor="reminder-time">{t('notifications.settings.time')}</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => onUpdateSettings({ reminderTime: e.target.value })}
                    className="w-32"
                    disabled={!settings.enabled}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Streak reminders */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <Flame className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <Label htmlFor="streak-reminder" className="font-medium">
                      {t('notifications.settings.streakReminder')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('notifications.settings.streakReminderDesc')}
                    </p>
                  </div>
                </div>
                <Switch
                  id="streak-reminder"
                  checked={settings.streakReminder}
                  onCheckedChange={(checked) => onUpdateSettings({ streakReminder: checked })}
                  disabled={!settings.enabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Encouragement */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/30">
                    <Heart className="h-4 w-4 text-pink-500" />
                  </div>
                  <div>
                    <Label htmlFor="encouragement" className="font-medium">
                      {t('notifications.settings.encouragement')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('notifications.settings.encouragementDesc')}
                    </p>
                  </div>
                </div>
                <Switch
                  id="encouragement"
                  checked={settings.encouragement}
                  onCheckedChange={(checked) => onUpdateSettings({ encouragement: checked })}
                  disabled={!settings.enabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
