import { Router } from 'express';
import { getProgress, updateProgress, completeDay } from '../controllers/progress.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getProgress);
router.put('/', updateProgress);
router.post('/complete-day', completeDay);

export default router;
