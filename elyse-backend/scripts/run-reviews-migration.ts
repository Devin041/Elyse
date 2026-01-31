import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('🔄 Running reviews & landing page migration...\n');

        console.log('🗑️  Dropping existing tables and indexes...');
        await client.query(`
      DROP INDEX IF EXISTS idx_reviews_product;
      DROP INDEX IF EXISTS idx_reviews_approved;
      DROP INDEX IF EXISTS idx_blog_posts_slug;
      DROP INDEX IF EXISTS idx_blog_posts_published;
      
      DROP TABLE IF EXISTS media_files CASCADE;
      DROP TABLE IF EXISTS featured_blog_posts CASCADE;
      DROP TABLE IF EXISTS blog_section_config CASCADE;
      DROP TABLE IF EXISTS blog_posts CASCADE;
      DROP TABLE IF EXISTS carousel_tabs CASCADE;
      DROP TABLE IF EXISTS product_carousel CASCADE;
      DROP TABLE IF EXISTS appointment_cta CASCADE;
      DROP TABLE IF EXISTS gift_cards_banner CASCADE;
      DROP TABLE IF EXISTS brand_story CASCADE;
      DROP TABLE IF EXISTS product_sections CASCADE;
      DROP TABLE IF EXISTS occasion_categories CASCADE;
      DROP TABLE IF EXISTS hero_sections CASCADE;
      DROP TABLE IF EXISTS reviews CASCADE;
    `);

        const migrationPath = path.join(__dirname, '../../database/migrations/003_reviews_landing.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await client.query(sql);

        console.log('✅ Migration applied successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
