import { query } from '../src/config/database.config.js';

async function checkImages() {
    try {
        console.log('\n=== CHECKING MOST RECENT PRODUCT ===\n');

        // Get most recent product with images
        const result = await query(`
            SELECT 
                p.id,
                p.name,
                p.slug,
                (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count,
                (SELECT json_agg(json_build_object('url', url, 'variant_id', variant_id, 'is_primary', is_primary)) 
                 FROM product_images WHERE product_id = p.id) as images
            FROM products p
            ORDER BY p.created_at DESC
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            console.log('❌ No products found!');
            process.exit(1);
        }

        const product = result.rows[0];
        console.log('Latest Product:');
        console.log('  Name:', product.name);
        console.log('  Slug:', product.slug);
        console.log('  Image Count:', product.image_count);
        console.log('\nImages in database:');
        console.log(JSON.stringify(product.images, null, 2));

        if (product.image_count === 0) {
            console.log('\n❌ NO IMAGES IN DATABASE!');
            console.log('   Frontend created product but images were NOT saved.');
            console.log('   → Check validator: Does it accept "images" field?');
            console.log('   → Check backend logs for INSERT errors');
        } else {
            console.log('\n✅ Images found in database!');
            console.log(`   ${product.image_count} image(s) saved successfully`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkImages();
