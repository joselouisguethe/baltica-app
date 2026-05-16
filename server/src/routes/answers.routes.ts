import { Router } from 'express';
import { getAnswers, upsertAnswers } from '../controllers/answers.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getAnswers);
router.put('/:dayKey', upsertAnswers);

export default router;
