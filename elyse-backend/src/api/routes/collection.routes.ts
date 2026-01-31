import { Router } from 'express';
import * as collectionController from '../controllers/collection.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', collectionController.getCollections);
router.get('/:id', collectionController.getCollection);
router.get('/slug/:slug', collectionController.getCollectionBySlug);

// Protected routes (Admin only)
router.post('/', authenticate, authorize(['admin']), collectionController.createCollection);
router.patch('/:id', authenticate, authorize(['admin']), collectionController.updateCollection);
// router.patch('/:id', collectionController.updateCollection);
router.delete('/:id', authenticate, authorize(['admin']), collectionController.deleteCollection);

export default router;
