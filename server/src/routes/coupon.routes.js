import { Router } from 'express';
import * as ctrl from '../controllers/coupon.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);

router.post('/validate', ctrl.validate);
router.get('/', adminOnly, ctrl.list);
router.post('/', adminOnly, ctrl.create);
router.put('/:code', adminOnly, ctrl.update);
router.delete('/:code', adminOnly, ctrl.remove);

export default router;
