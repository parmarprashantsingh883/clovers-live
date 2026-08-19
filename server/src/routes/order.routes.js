import { Router } from 'express';
import * as ctrl from '../controllers/order.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);

router.get('/', ctrl.listOrders);
router.post('/', ctrl.createOrder);
router.get('/:id', ctrl.getOrder);
router.post('/:id/verify-payment', ctrl.verifyPayment);
router.post('/:id/cancel', ctrl.cancelOrder);
router.post('/:id/reorder', ctrl.reorder);
router.put('/:id', adminOnly, ctrl.updateOrder);
router.patch('/:id', adminOnly, ctrl.updateOrder);
router.delete('/:id', adminOnly, ctrl.deleteOrder);

export default router;
