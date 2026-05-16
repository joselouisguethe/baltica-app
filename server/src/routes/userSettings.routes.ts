import { Router } from 'express';
import { getUserSettings, updateUserSettings } from '../controllers/userSettings.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Auth required, but NOT admin-only
router.use(authMiddleware);

router.get('/', getUserSettings);
router.put('/', updateUserSettings);

export default router;
