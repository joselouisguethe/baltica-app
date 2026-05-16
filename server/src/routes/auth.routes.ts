import { Router } from 'express';
import { register, login, getMe, updateMe, changePassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);
router.put('/me/password', authMiddleware, changePassword);

export default router;
