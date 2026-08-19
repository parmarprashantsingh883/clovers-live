import { Router } from 'express';
import * as ctrl from '../controllers/account.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);

// wishlist
router.get('/wishlist', ctrl.getWishlist);
router.post('/wishlist/toggle', ctrl.toggleWishlist);

// address book
router.get('/addresses', ctrl.listAddresses);
router.post('/addresses', ctrl.createAddress);
router.put('/addresses/:id', ctrl.updateAddress);
router.delete('/addresses/:id', ctrl.deleteAddress);

export default router;
