import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockActivityLogs } from '@/config/content';
import { Shield, Filter, Download, Info } from 'lucide-react';
import { motion } from 'framer-motion';

type FilterType = 'all' | 'access' | 'progress' | 'media' | 'payments';

export default function ActivityLogPage() {
  const { t } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: t('activityLog.filter.all') },
    { value: 'access', label: t('activityLog.filter.access') },
    { value: 'progress', label: t('activityLog.filter.progress') },
    { value: 'media', label: t('activityLog.filter.media') },
    { value: 'payments', label: t('activityLog.filter.payments') },
  ];

  const getEventTypeCategory = (eventType: string): FilterType => {
    if (eventType === 'login') return 'access';
    if (eventType.includes('day')) return 'progress';
    if (eventType.includes('media')) return 'media';
    if (eventType.includes('payment')) return 'payments';
    return 'all';
  };

  const filteredLogs = mockActivityLogs.filter((log) => {
    if (activeFilter === 'all') return true;
    return getEventTypeCategory(log.event_type) === activeFilter;
  });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case 'login':
        return 'secondary';
      case 'day_started':
      case 'day_completed':
        return 'default';
      case 'media_started':
      case 'media_completed':
        return 'outline';
      case 'payment_event':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const translateEventType = (eventType: string) => {
    const key = `activityLog.event.${eventType}` as any;
    return t(key) || eventType;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-secondary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('activityLog.title')}
          </h1>
        </motion.div>

        {/* Explanation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-card mb-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    {t('activityLog.why.title')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('activityLog.why.text')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex flex-wrap gap-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Filter className="h-5 w-5 text-muted-foreground mr-2" />
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter.value)}
              className="rounded-full"
            >
              {filter.label}
            </Button>
          ))}
        </motion.div>

        {/* Activity Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Registro de actividad</CardTitle>
                <CardDescription>
                  {filteredLogs.length} eventos
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('activityLog.column.date')}</TableHead>
                      <TableHead>{t('activityLog.column.activity')}</TableHead>
                      <TableHead>{t('activityLog.column.detail')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEventBadgeVariant(log.event_type) as any}>
                            {translateEventType(log.event_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.event_detail}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No hay eventos en esta categoría
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
