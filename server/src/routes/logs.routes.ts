import { Router } from 'express';
import { getLogs } from '../controllers/logs.controller';
import { authMiddleware } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.use(authMiddleware, adminOnly);
router.get('/', getLogs);

export default router;
