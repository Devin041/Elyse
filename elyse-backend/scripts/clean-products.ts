import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function cleanProducts() {
    const client = await pool.connect();

    try {
        console.log('🧹 Cleaning existing test products...\n');

        // Delete in correct order due to foreign keys
        await client.query('DELETE FROM product_variants');
        console.log('   ✓ Cleared variants');

        await client.query('DELETE FROM product_colors');
        console.log('   ✓ Cleared colors');

        await client.query('DELETE FROM product_images');
        console.log('   ✓ Cleared images');

        await client.query(`DELETE FROM products WHERE created_at > NOW() - INTERVAL '2 hours'`);
        console.log('   ✓ Cleared recent products\n');

        console.log('✅ Database cleaned and ready for fresh seeding!');

    } catch (error) {
        console.error('❌ Cleaning failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

cleanProducts()
    .then(() => {
        console.log('\n✅ Ready to seed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
