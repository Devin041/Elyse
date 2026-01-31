import { query } from '../src/config/database.config';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        console.log('🚀 Running migration: Enhanced Product Schema...\n');

        // Read migration file
        const migrationPath = path.join(__dirname, '../migrations/007_enhanced_product_schema.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Execute migration
        await query(migrationSQL);

        console.log('✅ Migration completed successfully!\n');
        console.log('Changes applied:');
        console.log('  - Added color & color_hex to product_variants');
        console.log('  - Created product_variant_images table');
        console.log('  - Added SEO fields to products');
        console.log('  - Added product details fields');
        console.log('\n✨ Database schema updated for production-grade features!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
