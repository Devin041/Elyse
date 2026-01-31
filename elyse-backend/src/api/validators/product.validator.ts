import { z } from 'zod';

/**
 * Product Validation Schemas
 */

// Create product schema (Admin only)
export const createProductSchema = z.object({
    name: z.string().min(1, 'Product name is required').max(255),
    slug: z.string().min(1, 'Slug is required').max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    description: z.string().optional(),
    basePrice: z.number().min(0, 'Price must be positive'),
    salePrice: z.number().min(0).optional(),
    categoryId: z.string().uuid('Invalid category ID'),
    sku: z.string().max(100).optional(),
    fabric: z.string().optional(),
    careInstructions: z.string().optional(),
    shippingInfo: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    isActive: z.boolean().optional(),
    badge: z.string().max(50).optional(),
    metaTitle: z.string().max(255).optional(),
    metaDescription: z.string().optional(),
    images: z.array(z.string().url('Invalid image URL')).optional(), // ⭐ PRIMARY IMAGES
    tags: z.array(z.string()).optional(),
});

// Update product schema (Admin only)
export const updateProductSchema = createProductSchema.partial();

// Product variant schema
export const createVariantSchema = z.object({
    productId: z.string().uuid(),
    sku: z.string().min(1, 'SKU is required').max(100),
    size: z.string().max(20).optional(),
    color: z.string().max(100).optional(),
    colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    price: z.number().min(0).optional(),
    compareAtPrice: z.number().min(0).optional(),
    inventoryCount: z.number().int().min(0, 'Inventory must be non-negative'),
    weightGrams: z.number().int().min(0).optional(),
    barcode: z.string().max(50).optional(),
    requiresShipping: z.boolean().optional(),
    taxable: z.boolean().optional(),
});

export const updateVariantSchema = createVariantSchema.partial().omit({ productId: true });

// Product image schema
export const addProductImageSchema = z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    url: z.string().url('Invalid image URL'),
    altText: z.string().max(255).optional(),
    displayOrder: z.number().int().min(0).optional(),
    isPrimary: z.boolean().optional(),
});

// Query filters schema
export const productFiltersSchema = z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
    categoryId: z.string().uuid().optional(),
    categorySlug: z.string().optional(),
    minPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
    maxPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
    search: z.string().optional(),
    isFeatured: z.string().transform(val => val === 'true').optional(),
    isNewArrival: z.string().transform(val => val === 'true').optional(),
    inStock: z.string().transform(val => val === 'true').optional(),
    tag: z.string().optional(),
    color: z.string().optional(),
    size: z.string().optional(),
    sortBy: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest', 'popular']).optional(),
});

export const createBulkVariantSchema = z.object({
    variants: z.array(createVariantSchema.omit({ productId: true })),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type CreateBulkVariantInput = z.infer<typeof createBulkVariantSchema>;
export type AddProductImageInput = z.infer<typeof addProductImageSchema>;
export type ProductFilters = z.infer<typeof productFiltersSchema>;
