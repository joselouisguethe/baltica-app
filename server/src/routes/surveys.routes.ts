import { Router } from 'express';
import { getSurvey, submitSurvey, getAllSurveys } from '../controllers/surveys.controller';
import { authMiddleware } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.use(authMiddleware);

router.get('/all', adminOnly, getAllSurveys);
router.get('/', getSurvey);
router.post('/', submitSurvey);

export default router;
