import { Router } from 'express';
import { getDiploma, issueDiploma } from '../controllers/diplomas.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getDiploma);
router.post('/', issueDiploma);

export default router;
