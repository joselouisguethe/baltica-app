import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { authMiddleware } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.use(authMiddleware, adminOnly);

router.get('/', getSettings);
router.put('/', updateSettings);

export default router;
