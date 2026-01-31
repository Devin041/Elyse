import { query } from '../../config/database.config';
import { NotFoundError, ConflictError } from '../../utils/errors/AppError';
import logger from '../../utils/logger';
import type { CreateCollectionInput, UpdateCollectionInput } from '../validators/collection.validator';

// Helper to generate slug
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

export const createCollection = async (input: CreateCollectionInput) => {
    const { name, description, imageUrl, isActive = true, displayOrder = 0 } = input;
    let { slug } = input;

    if (!slug) {
        slug = generateSlug(name);
    }

    // Check if slug exists
    const existing = await query('SELECT id FROM collections WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
        throw new ConflictError('Collection with this slug already exists');
    }

    const result = await query(
        `INSERT INTO collections (
            name, slug, description, image_url, is_active, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [name, slug, description, imageUrl, isActive, displayOrder]
    );

    logger.info('Collection created', { collectionId: result.rows[0].id });
    return result.rows[0];
};

export const getCollections = async (includeInactive = false) => {
    let queryStr = `SELECT * FROM collections`;

    if (!includeInactive) {
        queryStr += ' WHERE is_active = true';
    }

    queryStr += ' ORDER BY display_order ASC, name ASC';

    const result = await query(queryStr);
    return result.rows;
};

export const getCollectionById = async (id: string) => {
    const result = await query(
        `SELECT * FROM collections WHERE id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Collection not found');
    }

    return result.rows[0];
};

export const getCollectionBySlug = async (slug: string) => {
    const result = await query(
        `SELECT * FROM collections WHERE slug = $1`,
        [slug]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Collection not found');
    }

    return result.rows[0];
};

export const updateCollection = async (id: string, input: UpdateCollectionInput) => {
    const { name, slug, description, imageUrl, isActive, displayOrder } = input;

    // Check if collection exists
    const existing = await getCollectionById(id);

    // Check slug uniqueness if changing
    if (slug && slug !== existing.slug) {
        const slugCheck = await query('SELECT id FROM collections WHERE slug = $1 AND id != $2', [slug, id]);
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
    if (isActive !== undefined) { updates.push(`is_active = $${paramCount++}`); params.push(isActive); }
    if (displayOrder !== undefined) { updates.push(`display_order = $${paramCount++}`); params.push(displayOrder); }

    if (updates.length === 0) return existing;

    const result = await query(
        `UPDATE collections SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        params
    );

    logger.info('Collection updated', { collectionId: id });
    return result.rows[0];
};

export const deleteCollection = async (id: string) => {
    const result = await query('DELETE FROM collections WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
        throw new NotFoundError('Collection not found');
    }

    logger.info('Collection deleted', { collectionId: id });
    return true;
};
