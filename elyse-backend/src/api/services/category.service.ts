import { query } from '../../config/database.config';
import { NotFoundError, ConflictError } from '../../utils/errors/AppError';
import logger from '../../utils/logger';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';

// Helper to generate slug
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

export const createCategory = async (input: CreateCategoryInput) => {
    const { name, description, imageUrl, posterUrl, parentId, isActive = true, displayOrder = 0 } = input;
    let { slug } = input;

    if (!slug) {
        slug = generateSlug(name);
    }

    // Check if slug exists
    const existing = await query('SELECT id FROM categories WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
        throw new ConflictError('Category with this slug already exists');
    }

    const result = await query(
        `INSERT INTO categories (
            name, slug, description, image_url, poster_url, parent_id, is_active, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [name, slug, description, imageUrl, posterUrl, parentId, isActive, displayOrder]
    );

    logger.info('Category created', { categoryId: result.rows[0].id });
    return result.rows[0];
};

export const getCategories = async (includeInactive = false) => {
    let queryStr = `
        SELECT c.*, 
               p.name as parent_name,
               (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
        FROM categories c
        LEFT JOIN categories p ON c.parent_id = p.id
    `;

    if (!includeInactive) {
        queryStr += ' WHERE c.is_active = true';
    }

    queryStr += ' ORDER BY c.display_order ASC, c.name ASC';

    const result = await query(queryStr);
    return result.rows;
};

export const getCategoryById = async (id: string) => {
    const result = await query(
        `SELECT c.*, p.name as parent_name
         FROM categories c
         LEFT JOIN categories p ON c.parent_id = p.id
         WHERE c.id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Category not found');
    }

    return result.rows[0];
};

export const getCategoryBySlug = async (slug: string) => {
    const result = await query(
        `SELECT * FROM categories WHERE slug = $1`,
        [slug]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Category not found');
    }

    return result.rows[0];
};

export const updateCategory = async (id: string, input: UpdateCategoryInput) => {
    const { name, slug, description, imageUrl, posterUrl, parentId, isActive, displayOrder } = input;

    // Check if category exists
    const existing = await getCategoryById(id);

    // Check slug uniqueness if changing
    if (slug && slug !== existing.slug) {
        const slugCheck = await query('SELECT id FROM categories WHERE slug = $1 AND id != $2', [slug, id]);
        if (slugCheck.rows.length > 0) {
            throw new ConflictError('Slug already in use');
        }
    }

    const updates: string[] = [];
    const params: any[] = [id];
    let paramCount = 2;

    if (name !== undefined) { updates.push(`name = $${paramCount++}`); params.push(name); }
    if (slug !== undefined) { updates.push(`slug = $${paramCount++}`); params.push(slug); }
    if (description !== undefined) { updates.push(`description = $${paramCount++}`); params.push(description); }
    if (imageUrl !== undefined) { updates.push(`image_url = $${paramCount++}`); params.push(imageUrl); }
    if (posterUrl !== undefined) { updates.push(`poster_url = $${paramCount++}`); params.push(posterUrl); }
    if (parentId !== undefined) { updates.push(`parent_id = $${paramCount++}`); params.push(parentId); }
    if (isActive !== undefined) { updates.push(`is_active = $${paramCount++}`); params.push(isActive); }
    if (displayOrder !== undefined) { updates.push(`display_order = $${paramCount++}`); params.push(displayOrder); }

    if (updates.length === 0) return existing;

    const result = await query(
        `UPDATE categories SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        params
    );

    logger.info('Category updated', { categoryId: id });
    return result.rows[0];
};

export const deleteCategory = async (id: string) => {
    // Check for products
    const products = await query('SELECT id FROM products WHERE category_id = $1 LIMIT 1', [id]);
    if (products.rows.length > 0) {
        throw new ConflictError('Cannot delete category containing products');
    }

    // Check for subcategories
    const children = await query('SELECT id FROM categories WHERE parent_id = $1 LIMIT 1', [id]);
    if (children.rows.length > 0) {
        throw new ConflictError('Cannot delete category containing subcategories');
    }

    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
        throw new NotFoundError('Category not found');
    }

    logger.info('Category deleted', { categoryId: id });
    return true;
};
