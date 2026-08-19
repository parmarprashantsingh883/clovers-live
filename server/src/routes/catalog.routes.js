import { Router } from 'express';
import * as ctrl from '../controllers/catalog.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = Router();

// Public reads
router.get('/products', ctrl.listProducts);
router.get('/products/:id', ctrl.getProduct);
router.get('/products/:id/reviews', ctrl.listReviews);
router.post('/products/:id/reviews', protect, ctrl.createReview);
router.get('/categories', ctrl.listCategories);
router.get('/promoBanners', ctrl.listBanners('promo'));
router.get('/wideBanners', ctrl.listBanners('wide'));

// Admin writes
router.post('/products', protect, adminOnly, ctrl.createProduct);
router.put('/products/:id', protect, adminOnly, ctrl.updateProduct);
router.patch('/products/:id', protect, adminOnly, ctrl.updateProduct);
router.delete('/products/:id', protect, adminOnly, ctrl.deleteProduct);
router.post('/categories', protect, adminOnly, ctrl.createCategory);
router.put('/categories/:id', protect, adminOnly, ctrl.updateCategory);
router.patch('/categories/:id', protect, adminOnly, ctrl.updateCategory);
router.delete('/categories/:id', protect, adminOnly, ctrl.deleteCategory);

export default router;
