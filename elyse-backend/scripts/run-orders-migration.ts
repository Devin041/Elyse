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
        console.log('🔄 Running orders migration...\n');

        console.log('🗑️  Dropping existing tables to ensure clean schema...');
        await client.query(`
      DROP TABLE IF EXISTS order_status_history CASCADE;
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS cart_items CASCADE;
      DROP TABLE IF EXISTS wishlist_items CASCADE;
      DROP TABLE IF EXISTS stock_notifications CASCADE;
      DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
    `);

        const migrationPath = path.join(__dirname, '../../database/migrations/002_cart_orders.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await client.query(sql);

        console.log('✅ Migration applied successfully!');

        // Verify columns
        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='orders'");
        console.log('   Current columns:', res.rows.map(r => r.column_name).join(', '));

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
