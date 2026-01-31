import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as categoryController from '../controllers/category.controller';

const router = Router();

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', categoryController.getCategories);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', categoryController.getCategory);

/**
 * @route   GET /api/v1/categories/slug/:slug
 * @desc    Get category by Slug
 * @access  Public
 */
router.get('/slug/:slug', categoryController.getCategoryBySlug);

/**
 * @route   POST /api/v1/categories
 * @desc    Create a new category
 * @access  Private (Admin only)
 */
router.post(
    '/',
    authenticate,
    authorize(['admin']),
    categoryController.createCategory
);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update a category
 * @access  Private (Admin only)
 */
router.put(
    '/:id',
    authenticate,
    authorize(['admin']),
    categoryController.updateCategory
);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete a category
 * @access  Private (Admin only)
 */
router.delete(
    '/:id',
    authenticate,
    authorize(['admin']),
    categoryController.deleteCategory
);

export default router;
