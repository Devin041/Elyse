import { query } from '../src/config/database.config';

async function getCategoryID() {
    try {
        const result = await query(
            'SELECT id, name, slug FROM categories WHERE slug = $1',
            ['men']
        );

        if (result.rows.length === 0) {
            console.log('❌ "Men" category not found');
        } else {
            console.log('✅ Found "Men" category:');
            console.log('ID:', result.rows[0].id);
            console.log('Name:', result.rows[0].name);
            console.log('Slug:', result.rows[0].slug);
            console.log('\n📝 Update this ID in:');
            console.log('File: elyse-admin/src/app/(dashboard)/products/new/page.tsx');
            console.log('Line 20: categoryId: "' + result.rows[0].id + '"');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
    process.exit(0);
}

getCategoryID();
