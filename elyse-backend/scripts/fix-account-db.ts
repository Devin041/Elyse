import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runFixMigration() {
    const client = await pool.connect();
    try {
        console.log('🚀 Running Account Hub DB Fix Migration...');

        const sqlPath = join(__dirname, '../src/database/migrations/010_fix_user_sync_and_rls.sql');
        const sql = readFileSync(sqlPath, 'utf-8');

        // Split the SQL into individual statements to handle errors gracefully if needed
        // But the script is robust with IF NOT EXISTS, so we can run it safely
        await client.query(sql);

        console.log('✅ Migration 010 completed successfully!');
        console.log('   - Fixed user sync trigger');
        console.log('   - Enabled RLS on addresses and wishlists');
        console.log('   - Relaxed password requirement for OAuth users');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runFixMigration();
