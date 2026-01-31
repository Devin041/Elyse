import { query } from '../src/config/database.config';

async function insertDefaultCategory() {
    try {
        // Check if category already exists
        const existing = await query(
            'SELECT id FROM categories WHERE id = $1',
            ['c2cb0b07-86ef-4b5e-b2c0-466fa8a1cd50']
        );

        if (existing.rows.length > 0) {
            console.log('✅ Default category already exists!');
            console.log('ID:', existing.rows[0].id);
            return;
        }

        // Insert default category with the exact UUID that the form uses
        const result = await query(
            `INSERT INTO categories (id, name, slug, description, is_active)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, slug`,
            [
                'c2cb0b07-86ef-4b5e-b2c0-466fa8a1cd50',
                'Men',
                'men',
                'Men\'s clothing and accessories',
                true
            ]
        );

        console.log('✅ Default category created!');
        console.log('ID:', result.rows[0].id);
        console.log('Name:', result.rows[0].name);
        console.log('Slug:', result.rows[0].slug);
    } catch (error) {
        console.error('❌ Error:', error);
    }
    process.exit(0);
}

insertDefaultCategory();
