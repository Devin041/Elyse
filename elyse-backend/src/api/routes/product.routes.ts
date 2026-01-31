import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
    createProductSchema,
    updateProductSchema,
    createVariantSchema,
    createBulkVariantSchema,
    addProductImageSchema,
    productFiltersSchema,
} from '../validators/product.validator';
import * as productService from '../services/product.service';

const router = Router();

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with filters and pagination
 * @access  Public
 */
router.get(
    '/',
    validate(productFiltersSchema, 'query'),
    asyncHandler(async (req, res) => {
        const result = await productService.getProducts(req.query as any);

        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    })
);

/**
 * @route   GET /api/v1/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get(
    '/featured',
    asyncHandler(async (req, res) => {
        const limit = parseInt(req.query.limit as string) || 8;
        const products = await productService.getFeaturedProducts(limit);

        res.json({
            success: true,
            data: products,
        });
    })
);

/**
 * @route   GET /api/v1/products/new-arrivals
 * @desc    Get new arrival products
 * @access  Public
 */
router.get(
    '/new-arrivals',
    asyncHandler(async (req, res) => {
        const limit = parseInt(req.query.limit as string) || 8;
        const products = await productService.getNewArrivals(limit);

        res.json({
            success: true,
            data: products,
        });
    })
);

/**
 * @route   GET /api/v1/products/by-id/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get(
    '/by-id/:id',
    asyncHandler(async (req, res) => {
        const product = await productService.getProductById(req.params.id);

        res.json({
            success: true,
            data: product,
        });
    })
);

/**
 * @route   GET /api/v1/products/:slug
 * @desc    Get single product by slug
 * @access  Public
 */
router.get(
    '/:slug',
    asyncHandler(async (req, res) => {
        const product = await productService.getProductBySlug(req.params.slug);

        res.json({
            success: true,
            data: product,
        });
    })
);

/**
 * @route   POST /api/v1/products
 * @desc    Create new product
 * @access  Private/Admin
 */
router.post(
    '/',
    authenticate,
    authorize(['admin', 'inventory_manager']),
    validate(createProductSchema),
    asyncHandler(async (req, res) => {
        const product = await productService.createProduct(req.body);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product,
        });
    })
);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product
 * @access  Private/Admin
 */
router.put(
    '/:id',
    authenticate,
    authorize(['admin', 'inventory_manager']),
    validate(updateProductSchema),
    asyncHandler(async (req, res) => {
        const product = await productService.updateProduct(req.params.id, req.body);

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product,
        });
    })
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product (soft delete)
 * @access  Private/Admin
 */
router.delete(
    '/:id',
    authenticate,
    authorize(['admin']),
    asyncHandler(async (req, res) => {
        const result = await productService.deleteProduct(req.params.id);

        res.json({
            success: true,
            message: result.message,
        });
    })
);

/**
 * @route   POST /api/v1/products/:id/variants
 * @desc    Add product variant
 * @access  Private/Admin
 */
router.post(
    '/:id/variants',
    authenticate,
    authorize(['admin', 'inventory_manager']),
    validate(createVariantSchema),
    asyncHandler(async (req, res) => {
        const variant = await productService.createProductVariant({
            ...req.body,
            productId: req.params.id,
        });

        res.status(201).json({
            success: true,
            message: 'Variant created successfully',
            data: variant,
        });
    })
);

/**
 * @route   POST /api/v1/products/:id/variants/bulk
 * @desc    Bulk create product variants
 * @access  Private/Admin
 */
router.post(
    '/:id/variants/bulk',
    authenticate,
    authorize(['admin', 'inventory_manager']),
    validate(createBulkVariantSchema),
    asyncHandler(async (req, res) => {
        const variants = await productService.createBulkVariants(req.params.id, req.body.variants);

        res.status(201).json({
            success: true,
            message: 'Variants created successfully',
            data: variants,
        });
    })
);

/**
 * @route   POST /api/v1/products/:id/duplicate
 * @desc    Duplicate a product
 * @access  Private/Admin
 */
router.post(
    '/:id/duplicate',
    authenticate,
    authorize(['admin', 'inventory_manager']),
    asyncHandler(async (req, res) => {
        const product = await productService.duplicateProduct(req.params.id);

        res.status(201).json({
            success: true,
            message: 'Product duplicated successfully',
            data: product,
        });
    })
);

/**
 * @route   PATCH /api/v1/products/variants/:variantId/inventory
 * @desc    Update variant inventory
 * @access  Private/Admin
 */
router.patch(
    '/variants/:variantId/inventory',
    authenticate,
    authorize(['admin', 'inventory_manager']),
    asyncHandler(async (req, res) => {
        const { inventoryCount } = req.body;
        const variant = await productService.updateVariantInventory(
            req.params.variantId,
            inventoryCount
        );

        res.json({
            success: true,
            message: 'Inventory updated successfully',
            data: variant,
        });
    })
);

/**
 * @route   POST /api/v1/products/:id/images
 * @desc    Add product image
 * @access  Private/Admin
 */
router.post(
    '/:id/images',
    authenticate,
    authorize(['admin', 'content_manager']),
    validate(addProductImageSchema),
    asyncHandler(async (req, res) => {
        const image = await productService.addProductImage({
            ...req.body,
            productId: req.params.id,
        });

        res.status(201).json({
            success: true,
            message: 'Image added successfully',
            data: image,
        });
    })
);

/**
 * @route   GET /api/v1/products/variants/:variantId/images
 * @desc    Get variant images
 * @access  Public
 */
router.get(
    '/variants/:variantId/images',
    asyncHandler(async (req, res) => {
        const images = await productService.getVariantImages(req.params.variantId);

        res.json({
            success: true,
            data: images,
        });
    })
);

/**
 * @route   POST /api/v1/products/variants/:variantId/images
 * @desc    Add images to variant
 * @access  Private/Admin
 */
router.post(
    '/variants/:variantId/images',
    authenticate,
    authorize(['admin', 'content_manager']),
    asyncHandler(async (req, res) => {
        const { images } = req.body;
        const result = await productService.addVariantImages(req.params.variantId, images);

        res.status(201).json({
            success: true,
            message: 'Variant images added successfully',
            data: result,
        });
    })
);

/**
 * @route   DELETE /api/v1/products/variants/images/:imageId
 * @desc    Delete variant image
 * @access  Private/Admin
 */
router.delete(
    '/variants/images/:imageId',
    authenticate,
    authorize(['admin', 'content_manager']),
    asyncHandler(async (req, res) => {
        const result = await productService.deleteVariantImage(req.params.imageId);

        res.json({
            success: true,
            message: result.message,
        });
    })
);

export default router;
