import { Router } from 'express';
import { getDiploma, issueDiploma, validateDiploma } from '../controllers/diplomas.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public certificate verification — must be declared before the auth guard.
router.get('/validate/:code', validateDiploma);

router.use(authMiddleware);

router.get('/', getDiploma);
router.post('/', issueDiploma);

export default router;
