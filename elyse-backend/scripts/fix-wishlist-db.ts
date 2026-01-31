import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('🚀 Updating wishlist_items schema...');
        const sqlPath = join(__dirname, '../src/database/migrations/011_update_wishlist_items_schema.sql');
        const sql = readFileSync(sqlPath, 'utf-8');
        await client.query(sql);
        console.log('✅ Migration 011 completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}
runMigration();
