import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { locales } from '@/lib/i18n';
import { Globe, Moon, Sun, Menu, X, HelpCircle, BarChart3, Home, Settings, Trophy, User, LogOut, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BalticaLogo from '@/components/brand/BalticaLogo';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';

export function Header() {
  const { locale, setLocale, theme, setTheme, t, userName, userEmail, userRole, logout, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    settings,
    updateSettings,
    permissionStatus,
    requestPermission,
  } = useNotificationContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // MVP: Nav items hidden for cleaner UI. Uncomment for future use.
  // const navItemsFuture = [
  //   { path: '/', label: t('nav.home'), icon: Home },
  //   { path: '/progress', label: t('nav.progress'), icon: BarChart3 },
  //   { path: '/achievements', label: t('nav.achievements'), icon: Trophy },
  // ];
  const navItems: { path: string; label: string; icon: any }[] = [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <BalticaLogo variant="header" size={72} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* Notifications - only when authenticated and not admin */}
          {isAuthenticated && userRole !== 'admin' && (
            <>
              <NotificationCenter
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearAll}
                onDelete={deleteNotification}
              />
              {/* <NotificationSettings
                settings={settings}
                onUpdateSettings={updateSettings}
                permissionStatus={permissionStatus}
                onRequestPermission={requestPermission}
              /> */}
            </>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun size={"2rem"} className='mx-2' />
            ) : (
              <Moon size={"2rem"} className='mx-2' />
            )}
            <span className="sr-only">{t('settings.theme')}</span>
          </Button>

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

          {/* Back button - pre-login pages */}
          {!isAuthenticated && location.pathname !== '/landing' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          )}

          {/* User Menu */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12">
                  <User size={"2rem"} className="h-6 w-6 mx-2" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b border-border/40">
                  <p className="text-sm font-medium">{userName || userEmail}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                  {userRole === 'admin' && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                      <Shield size={"2rem"} className="h-3 w-3 mx-2" /> Admin
                    </span>
                  )}
                </div>
                {userRole === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Shield size={"2rem"} className="mr-2" />
                    Panel Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate(userRole === 'admin' ? '/admin?tab=settings' : '/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  {t('nav.settings')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { logout(); navigate('/landing'); }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-3"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
