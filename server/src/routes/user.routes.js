import { Router } from 'express';
import * as ctrl from '../controllers/user.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);

router.put('/me', ctrl.updateMe);
router.get('/', adminOnly, ctrl.listUsers);
router.patch('/:id', adminOnly, ctrl.updateUser);

export default router;
