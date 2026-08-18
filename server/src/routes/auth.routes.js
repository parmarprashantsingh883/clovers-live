import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/admin/login', ctrl.adminLogin);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', protect, ctrl.me);

export default router;
