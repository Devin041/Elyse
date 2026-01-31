import { query, transaction } from '../../config/database.config';
import { CreateInquiryInput } from '../validators/inquiry.validator';
import logger from '../../utils/logger';

export async function createInquiry(input: CreateInquiryInput) {
    const { name, email, subject, message } = input;

    logger.info('Creating new inquiry', { name, email, subject });

    const result = await query(
        `INSERT INTO contact_inquiries (name, email, subject, message)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, email, subject, message]
    );

    return result.rows[0];
}

export async function getInquiries(filters: { status?: string; limit?: number; offset?: number } = {}) {
    const { status, limit = 10, offset = 0 } = filters;
    const params: any[] = [];
    let paramCount = 1;

    let sql = 'SELECT * FROM contact_inquiries';

    if (status) {
        sql += ` WHERE status = $${paramCount++}`;
        params.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
}
