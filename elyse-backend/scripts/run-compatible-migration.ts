import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runCompatibleMigration() {
    const client = await pool.connect();

    try {
        console.log('🚀 Running compatible landing page migration...\n');

        const migrationFile = path.join(__dirname, '..', '..', 'database', 'migrations', '004_landing_page_additions.sql');

        if (!fs.existsSync(migrationFile)) {
            throw new Error('Migration file not found');
        }

        console.log('📄 Running migration: 004_landing_page_additions.sql...');
        const sql = fs.readFileSync(migrationFile, 'utf8');

        await client.query(sql);
        console.log('✅ Migration completed successfully\n');

        // Verify new tables
        console.log('🔍 Verifying new tables...');
        const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN (
        'profiles', 'stock_notifications', 'occasion_categories', 'hero_sections',
        'product_sections', 'brand_story', 'gift_cards_banner', 'appointment_cta',
        'product_carousel', 'carousel_tabs', 'blog_section_config', 'featured_blog_posts'
      )
      ORDER BY table_name;
    `);

        console.log(`\n✅ Found ${result.rows.length} new landing page tables:`);
        result.rows.forEach((row: any) => {
            console.log(`   ✓ ${row.table_name}`);
        });

        console.log('\n🎉 Landing page database setup complete!');

    } catch (error: any) {
        if (error.message && error.message.includes('already exists')) {
            console.log('ℹ️  Tables already exist, migration successful');
        } else {
            console.error('❌ Migration failed:', error);
            throw error;
        }
    } finally {
        client.release();
        await pool.end();
    }
}

runCompatibleMigration()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
