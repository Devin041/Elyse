import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import imageRoutes from './image.routes';
import inquiryRoutes from './inquiry.routes';
import collectionRoutes from './collection.routes';

import categoryRoutes from './category.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/collections', collectionRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/images', imageRoutes);
router.use('/inquiries', inquiryRoutes);

export default router;
