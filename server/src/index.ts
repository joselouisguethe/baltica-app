import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import progressRoutes from './routes/progress.routes';
import answersRoutes from './routes/answers.routes';
import logsRoutes from './routes/logs.routes';
import paymentsRoutes from './routes/payments.routes';
import settingsRoutes from './routes/settings.routes';
import userSettingsRoutes from './routes/userSettings.routes';
import surveysRoutes from './routes/surveys.routes';
import diplomasRoutes from './routes/diplomas.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', usersRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/answers', answersRoutes);
app.use('/api/admin/logs', logsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/settings', userSettingsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/surveys', surveysRoutes);
app.use('/api/diplomas', diplomasRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In production, serve the Vite build
if (env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Error handler
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`BÁLTICA server running on port ${env.PORT}`);
});
