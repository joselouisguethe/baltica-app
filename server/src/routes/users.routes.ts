import { Router } from 'express';
import { listUsers, createUser, updateUser, suspendUser, reactivateUser, removeUser } from '../controllers/users.controller';
import { authMiddleware } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.use(authMiddleware, adminOnly);

router.get('/', listUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.put('/:id/suspend', suspendUser);
router.put('/:id/reactivate', reactivateUser);
router.delete('/:id', removeUser);

export default router;
