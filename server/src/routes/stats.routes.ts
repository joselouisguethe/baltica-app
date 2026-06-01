import { Router } from 'express';
import { getChannelStats } from '../controllers/stats.controller';
import { authMiddleware } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.use(authMiddleware, adminOnly);

router.get('/channels', getChannelStats);

export default router;
