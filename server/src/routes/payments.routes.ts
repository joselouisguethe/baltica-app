import { Router } from 'express';
import { webhook, createPreference, verifyPayment, getPlans } from '../controllers/payments.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/plans', getPlans);
router.post('/webhook', webhook);
router.post('/create-preference', authMiddleware, createPreference);
router.get('/verify/:paymentId', authMiddleware, verifyPayment);

export default router;
