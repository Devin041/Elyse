import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '../src/config/database.config';

async function runMigration() {
    try {
        console.log('Starting migration: Create product_images table...');

        const migrationSQL = readFileSync(
            join(__dirname, '../migrations/008_create_product_images.sql'),
            'utf-8'
        );

        await query(migrationSQL);

        console.log('✅ Migration completed successfully!');
        console.log('   - product_images table created');
        console.log('   - Indexes added for performance');
        console.log('   - Constraint added for one primary image per product');

        // Verify table was created
        const verification = await query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'product_images'
            ORDER BY ordinal_position
        `);

        console.log('\n📊 Table structure:');
        console.table(verification.rows);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
