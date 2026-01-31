import { query, transaction } from '../../config/database.config';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors/AppError';
import logger from '../../utils/logger';
import type {
    CreateProductInput,
    UpdateProductInput,
    CreateVariantInput,
    UpdateVariantInput,
    AddProductImageInput,
    ProductFilters,
} from '../validators/product.validator';

/**
 * Product Service
 * Handles product catalog management, variants, and filtering
 */

interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Get products with filters and pagination
export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<any>> {
    const {
        page = 1,
        limit = 20,
        categoryId,
        categorySlug,
        minPrice,
        maxPrice,
        search,
        isFeatured,
        isNewArrival,
        inStock,
        tag,
        sortBy = 'newest',
    } = filters;

    const offset = (page - 1) * limit;
    const conditions: string[] = ['p.is_active = true'];
    const params: any[] = [];
    let paramCount = 1;

    // Category filter
    if (categoryId) {
        conditions.push(`p.category_id = $${paramCount++}`);
        params.push(categoryId);
    }

    if (categorySlug) {
        conditions.push(`c.slug = $${paramCount++}`);
        params.push(categorySlug);
    }

    // Price filters
    if (minPrice !== undefined) {
        conditions.push(`COALESCE(p.sale_price, p.base_price) >= $${paramCount++}`);
        params.push(minPrice);
    }

    if (maxPrice !== undefined) {
        conditions.push(`COALESCE(p.sale_price, p.base_price) <= $${paramCount++}`);
        params.push(maxPrice);
    }

    // Search filter (full-text search on name and description)
    if (search) {
        conditions.push(
            `(to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', $${paramCount++}))`
        );
        params.push(search);
    }

    // Feature filters
    if (isFeatured !== undefined) {
        conditions.push(`p.is_featured = $${paramCount++}`);
        params.push(isFeatured);
    }

    if (isNewArrival !== undefined) {
        conditions.push(`p.is_new_arrival = $${paramCount++}`);
        params.push(isNewArrival);
    }

    // In stock filter
    if (inStock) {
        conditions.push(
            `EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.stock_quantity > 0)`
        );
    }

    // Tag filter
    if (tag) {
        conditions.push(
            `EXISTS (SELECT 1 FROM product_tags pt JOIN tags t ON pt.tag_id = t.id WHERE pt.product_id = p.id AND (t.name ILIKE $${paramCount++} OR t.slug = $${paramCount - 1}))`
        );
        params.push(tag);
    }

    // Color filter
    if (filters.color) {
        conditions.push(
            `EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.color ILIKE $${paramCount++})`
        );
        params.push(filters.color);
    }

    // Size filter
    if (filters.size) {
        conditions.push(
            `EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size ILIKE $${paramCount++})`
        );
        params.push(filters.size);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting
    let orderBy = 'p.created_at DESC';
    switch (sortBy) {
        case 'price_asc':
            orderBy = 'COALESCE(p.sale_price, p.base_price) ASC';
            break;
        case 'price_desc':
            orderBy = 'COALESCE(p.sale_price, p.base_price) DESC';
            break;
        case 'name_asc':
            orderBy = 'p.name ASC';
            break;
        case 'name_desc':
            orderBy = 'p.name DESC';
            break;
        case 'newest':
            orderBy = 'p.created_at DESC';
            break;
        case 'popular':
            // Rank featured products first, then by creation date
            orderBy = 'p.is_featured DESC, p.created_at DESC';
            break;
    }

    // Get total count
    const countResult = await query(
        `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`,
        params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get products with category info
    params.push(limit, offset);
    const result = await query(
        `SELECT 
      p.id, p.name, p.slug, p.description, p.base_price, p.sale_price,
      p.sku, p.fabric, p.care_instructions, p.is_featured, p.is_new_arrival,
      p.is_active, p.badge, p.created_at,
      c.name as category_name, c.slug as category_slug,
      (SELECT json_agg(json_build_object(
        'id', pi.id,
        'url', pi.url,
        'altText', pi.alt_text,
        'isPrimary', pi.is_primary
      ) ORDER BY pi.display_order, pi.is_primary DESC)
      FROM product_images pi WHERE pi.product_id = p.id AND pi.variant_id IS NULL) as images,
      (SELECT json_agg(json_build_object(
        'id', pv.id,
        'sku', pv.sku,
        'size', pv.size,
        'color', pv.color,
        'colorHex', pv.color_hex,
        'price', pv.price,
        'inventoryCount', pv.stock_quantity,
        'inventory', pv.stock_quantity,
        'inStock', (pv.stock_quantity > 0 AND pv.is_available = true)
      ))
      FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_available = true) as variants
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${paramCount++} OFFSET $${paramCount++}`,
        params
    );

    return {
        data: result.rows.map(row => ({
            ...row,
            images: row.images || [],
            variants: row.variants || [],
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// Get single product by slug
export async function getProductBySlug(slug: string) {
    const result = await query(
        `SELECT 
      p.*,
      c.name as category_name, c.slug as category_slug,
      (SELECT json_agg(json_build_object(
        'id', pi.id,
        'url', pi.url,
        'altText', pi.alt_text,
        'displayOrder', pi.display_order,
        'isPrimary', pi.is_primary
      ) ORDER BY pi.display_order, pi.is_primary DESC)
      FROM product_images pi WHERE pi.product_id = p.id AND pi.variant_id IS NULL) as images,
      (SELECT json_agg(json_build_object(
        'id', pv.id,
        'sku', pv.sku,
        'size', pv.size,
        'color', pv.color,
        'colorHex', pv.color_hex,
        'price', pv.price,
        'inventoryCount', pv.stock_quantity,
        'inventory', pv.stock_quantity,
        'inStock', (pv.stock_quantity > 0 AND pv.is_available = true),
        'weightGrams', pv.weight_grams,
        'isActive', pv.is_available,
        'images', (
            SELECT json_agg(json_build_object(
                'id', pi.id,
                'url', pi.url,
                'displayOrder', pi.display_order,
                'isPrimary', pi.is_primary
            ) ORDER BY pi.display_order)
            FROM product_images pi
            WHERE pi.variant_id = pv.id
        )
      ))
      FROM product_variants pv WHERE pv.product_id = p.id) as variants,
      (SELECT json_agg(DISTINCT t.name)
      FROM product_tags pt
      JOIN tags t ON pt.tag_id = t.id
      WHERE pt.product_id = p.id) as tags
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = $1 AND p.is_active = true`,
        [slug]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Product not found');
    }

    const product = result.rows[0];
    return {
        ...product,
        images: product.images || [],
        variants: product.variants || [],
        tags: product.tags || [],
    };
}

// Get single product by ID
export async function getProductById(id: string) {
    const result = await query(
        `SELECT 
      p.*,
      c.name as category_name, c.slug as category_slug,
      (SELECT json_agg(json_build_object(
        'id', pi.id,
        'url', pi.url,
        'altText', pi.alt_text,
        'displayOrder', pi.display_order,
        'isPrimary', pi.is_primary
      ) ORDER BY pi.display_order, pi.is_primary DESC)
      FROM product_images pi WHERE pi.product_id = p.id AND pi.variant_id IS NULL) as images,
      (SELECT json_agg(json_build_object(
        'id', pv.id,
        'sku', pv.sku,
        'size', pv.size,
        'color', pv.color,
        'colorHex', pv.color_hex,
        'price', pv.price,
        'inventoryCount', pv.stock_quantity,
        'inventory', pv.stock_quantity,
        'inStock', (pv.stock_quantity > 0 AND pv.is_available = true),
        'weightGrams', pv.weight_grams,
        'isActive', pv.is_available,
        'images', (
            SELECT json_agg(json_build_object(
                'id', pi.id,
                'url', pi.url,
                'displayOrder', pi.display_order,
                'isPrimary', pi.is_primary
            ) ORDER BY pi.display_order)
            FROM product_images pi
            WHERE pi.variant_id = pv.id
        )
      ))
      FROM product_variants pv WHERE pv.product_id = p.id) as variants,
      (SELECT json_agg(DISTINCT t.name)
      FROM product_tags pt
      JOIN tags t ON pt.tag_id = t.id
      WHERE pt.product_id = p.id) as tags
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = $1 AND p.is_active = true`,
        [id]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Product not found');
    }

    const product = result.rows[0];
    return {
        ...product,
        images: product.images || [],
        variants: product.variants || [],
        tags: product.tags || [],
    };
}

// Create new product (Admin only)
export async function createProduct(input: CreateProductInput) {
    const { slug, name, ...data } = input;

    // Extract images from input if present
    const images = (input as any).images;

    // Check if slug already exists
    const existing = await query('SELECT id FROM products WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
        throw new ConflictError('Product slug already exists');
    }

    return await transaction(async (client) => {
        const result = await client.query(
            `INSERT INTO products (
          name, slug, description, base_price, sale_price, category_id, sku,
          fabric, care_instructions, shipping_info, is_featured, is_new_arrival,
          badge, meta_title, meta_description, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
            [
                name,
                slug,
                data.description || null,
                data.basePrice,
                data.salePrice || null,
                data.categoryId,
                data.sku || null,
                data.fabric || null,
                data.careInstructions || null,
                data.shippingInfo || null,
                data.isFeatured || false,
                data.isNewArrival || false,
                data.badge || null,
                data.metaTitle || null,
                data.metaDescription || null,
                data.isActive !== undefined ? data.isActive : true,
            ]
        );

        const productId = result.rows[0].id;

        // Handle images if provided
        if (images && Array.isArray(images) && images.length > 0) {
            logger.info('Saving product images', { productId, imageCount: images.length });

            for (let i = 0; i < images.length; i++) {
                const imageUrl = images[i];
                await client.query(
                    `INSERT INTO product_images (
                        product_id, variant_id, url, alt_text, display_order, is_primary
                    ) VALUES ($1, $2, $3, $4, $5, $6)`,
                    [productId, null, imageUrl, null, i, i === 0] // variant_id=NULL for primary images
                );
            }

            logger.info('Product images saved successfully', { productId, imageCount: images.length });
        }

        // Handle tags if provided
        const tags = (input as any).tags;
        if (tags && Array.isArray(tags) && tags.length > 0) {
            for (const tagName of tags) {
                const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                // 1. Ensure tag exists
                await client.query(
                    `INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
                    [tagName, slug]
                );

                // 2. Get tag id
                const tagRes = await client.query(`SELECT id FROM tags WHERE slug = $1`, [slug]);
                const tagId = tagRes.rows[0].id;

                // 3. Link tag to product
                await client.query(
                    `INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [productId, tagId]
                );
            }
        }

        logger.info('Product created', { productId, slug, imagesCount: images?.length || 0 });

        return result.rows[0];
    }).then(async () => {
        // Return full product with images (Wait for commit, then fetch)
        return await getProductBySlug(slug);
    });
}

// Update product (Admin only)
export async function updateProduct(productId: string, input: UpdateProductInput) {
    // Check if slug is being updated and if it's unique
    if (input.slug) {
        const existing = await query(
            'SELECT id FROM products WHERE slug = $1 AND id != $2',
            [input.slug, productId]
        );
        if (existing.rows.length > 0) {
            throw new ConflictError('Product slug already exists');
        }
    }

    // Extract images from input if present
    const images = (input as any).images;
    const updateInput = { ...input };
    delete (updateInput as any).images;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updateInput).forEach(([key, value]) => {
        if (value !== undefined) {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            updates.push(`${snakeKey} = $${paramCount++}`);
            values.push(value);
        }
    });

    if (updates.length === 0 && !images) {
        throw new ValidationError('No fields to update');
    }

    if (updates.length > 0) {
        updates.push(`updated_at = NOW()`);
        values.push(productId);

        const result = await query(
            `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Product not found');
        }
    }

    // Handle images if provided
    if (images && Array.isArray(images)) {
        // Delete existing images for this product (but PRESERVE variant-specific ones if needed, 
        // actually for product-level update we usually just replace main images)
        await query('DELETE FROM product_images WHERE product_id = $1 AND variant_id IS NULL', [productId]);

        // Add new images
        for (let i = 0; i < images.length; i++) {
            const imageUrl = images[i];
            await query(
                `INSERT INTO product_images (
                    product_id, variant_id, url, alt_text, display_order, is_primary
                ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [productId, null, imageUrl, null, i, i === 0]
            );
        }
    }

    logger.info('Product updated', { productId, imagesUpdated: !!images });

    // Handle tags if provided
    const tags = (input as any).tags;
    if (tags && Array.isArray(tags)) {
        await transaction(async (client) => {
            // 1. Delete existing tags
            await client.query('DELETE FROM product_tags WHERE product_id = $1', [productId]);

            // 2. Add new tags
            for (const tagName of tags) {
                const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                // Ensure tag exists
                await client.query(
                    `INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
                    [tagName, slug]
                );

                // Get tag id
                const tagRes = await client.query(`SELECT id FROM tags WHERE slug = $1`, [slug]);
                const tagId = tagRes.rows[0].id;

                // Link tag to product
                await client.query(
                    `INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [productId, tagId]
                );
            }
        });
    }

    // Return updated product with images
    return await getProductBySlug((await query('SELECT slug FROM products WHERE id = $1', [productId])).rows[0].slug);
}

// Delete product (Admin only)
export async function deleteProduct(productId: string) {
    const result = await query(
        'UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
        [productId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Product not found');
    }

    logger.info('Product deleted (soft delete)', { productId });

    return { message: 'Product deleted successfully' };
}

// Create product variant
export async function createProductVariant(input: CreateVariantInput) {
    const { productId, ...data } = input;

    // Verify product exists
    const productCheck = await query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productCheck.rows.length === 0) {
        throw new NotFoundError('Product not found');
    }

    // Check SKU uniqueness
    const skuCheck = await query('SELECT id FROM product_variants WHERE sku = $1', [data.sku]);
    if (skuCheck.rows.length > 0) {
        throw new ConflictError('SKU already exists');
    }

    const result = await query(
        `INSERT INTO product_variants (
      product_id, sku, size, color, color_hex, price, compare_at_price,
      stock_quantity, weight_grams, barcode, requires_shipping, taxable, is_available
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
    RETURNING *`,
        [
            productId,
            data.sku,
            data.size || null,
            data.color || null,
            data.colorHex || null,
            data.price || null,
            data.compareAtPrice || null,
            data.inventoryCount,
            data.weightGrams || null,
            data.barcode || null,
            data.requiresShipping !== undefined ? data.requiresShipping : true,
            data.taxable !== undefined ? data.taxable : true,
        ]
    );

    logger.info('Product variant created', { variantId: result.rows[0].id, productId });

    return result.rows[0];
}

// Update product variant inventory
export async function updateVariantInventory(variantId: string, inventoryCount: number) {
    const result = await query(
        'UPDATE product_variants SET stock_quantity = $1 WHERE id = $2 RETURNING *',
        [inventoryCount, variantId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Variant not found');
    }

    return result.rows[0];
}

// Add product image
export async function addProductImage(input: AddProductImageInput) {
    const { productId, variantId, ...data } = input;

    const result = await query(
        `INSERT INTO product_images (
      product_id, variant_id, url, alt_text, display_order, is_primary
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
        [
            productId,
            variantId || null,
            data.url,
            data.altText || null,
            data.displayOrder || 0,
            data.isPrimary || false,
        ]
    );

    return result.rows[0];
}

// Get featured products
export async function getFeaturedProducts(limit: number = 8) {
    const result = await query(
        `SELECT 
      p.id, p.name, p.slug, p.base_price, p.sale_price, p.badge,
      (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
    FROM products p
    WHERE p.is_featured = true AND p.is_active = true
    ORDER BY p.created_at DESC
    LIMIT $1`,
        [limit]
    );

    return result.rows;
}

// Get new arrivals
export async function getNewArrivals(limit: number = 8) {
    const result = await query(
        `SELECT 
      p.id, p.name, p.slug, p.base_price, p.sale_price, p.badge,
      (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
    FROM products p
    WHERE p.is_new_arrival = true AND p.is_active = true
    ORDER BY p.created_at DESC
    LIMIT $1`,
        [limit]
    );

    return result.rows;
}

// Bulk create variants
export async function createBulkVariants(productId: string, variants: any[]) {
    const results = [];
    // We execute sequentially to avoid potential deadlocks or race conditions if any
    for (const variant of variants) {
        const result = await createProductVariant({ ...variant, productId });
        results.push(result);
    }
    return results;
}

// Get variant images
export async function getVariantImages(variantId: string) {
    const result = await query(
        'SELECT id, product_id, variant_id, url, display_order, is_primary FROM product_images WHERE variant_id = $1 ORDER BY display_order ASC',
        [variantId]
    );
    return result.rows;
}

// Add variant images
export async function addVariantImages(variantId: string, images: string[]) {
    // Verify variant exists
    const variantCheck = await query('SELECT id, product_id FROM product_variants WHERE id = $1', [variantId]);
    if (variantCheck.rows.length === 0) {
        throw new NotFoundError('Variant not found');
    }
    const productId = variantCheck.rows[0].product_id;

    const results = [];
    for (let i = 0; i < images.length; i++) {
        const result = await query(
            `INSERT INTO product_images (
                product_id, variant_id, url, display_order, is_primary
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [productId, variantId, images[i], i, i === 0]
        );
        results.push(result.rows[0]);
    }

    return results;
}

// Delete variant image
export async function deleteVariantImage(imageId: string) {
    const result = await query(
        'DELETE FROM product_images WHERE id = $1 RETURNING id',
        [imageId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Image not found');
    }

    return { message: 'Image deleted successfully' };
}

// Duplicate product
export async function duplicateProduct(id: string) {
    // 1. Get original product
    const productResult = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (productResult.rows.length === 0) {
        throw new NotFoundError('Product not found');
    }
    const original = productResult.rows[0];

    // 2. Create new product
    const newSlug = `${original.slug}-copy-${Date.now()}`;
    const newName = `Copy of ${original.name}`;

    const newProductResult = await query(
        `INSERT INTO products (
            name, slug, description, base_price, sale_price, category_id, 
            sku, fabric, care_instructions, shipping_info, 
            is_featured, is_new_arrival, is_active, meta_title, meta_description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
            newName, newSlug, original.description, original.base_price, original.sale_price, original.category_id,
            original.sku ? `${original.sku}-COPY-${Date.now().toString().slice(-4)}` : null, original.fabric, original.care_instructions, original.shipping_info,
            false, false, false, original.meta_title, original.meta_description
        ]
    );
    const newProduct = newProductResult.rows[0];

    // 3. Copy Product Images
    const imagesResult = await query('SELECT * FROM product_images WHERE product_id = $1', [id]);
    for (const img of imagesResult.rows) {
        await query(
            `INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary)
             VALUES ($1, $2, $3, $4, $5)`,
            [newProduct.id, img.url, img.alt_text, img.display_order, img.is_primary]
        );
    }

    // 4. Copy Variants
    const variantsResult = await query('SELECT * FROM product_variants WHERE product_id = $1', [id]);
    for (const variant of variantsResult.rows) {
        const newVariantResult = await query(
            `INSERT INTO product_variants (
                product_id, sku, size, color, color_hex, price, 
                stock_quantity, weight_grams, barcode, requires_shipping, taxable, is_available
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id`,
            [
                newProduct.id, variant.sku ? `${variant.sku}-COPY-${Date.now().toString().slice(-4)}` : null, variant.size, variant.color, variant.color_hex, variant.price,
                variant.stock_quantity, variant.weight_grams, variant.barcode, variant.requires_shipping, variant.taxable, true
            ]
        );
        const newVariantId = newVariantResult.rows[0].id;

        // 5. Copy Variant Images
        const variantImagesResult = await query('SELECT * FROM product_images WHERE variant_id = $1', [variant.id]);
        for (const vImg of variantImagesResult.rows) {
            await query(
                `INSERT INTO product_images (product_id, variant_id, url, display_order, is_primary)
                 VALUES ($1, $2, $3, $4, $5)`,
                [newProduct.id, newVariantId, vImg.url, vImg.display_order, vImg.is_primary]
            );
        }
    }

    return newProduct;
}
