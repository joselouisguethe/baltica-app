import { Router } from 'express';
import { webhook, createPreference, verifyPayment } from '../controllers/payments.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/webhook', webhook);
router.post('/create-preference', authMiddleware, createPreference);
router.get('/verify/:paymentId', authMiddleware, verifyPayment);

export default router;
