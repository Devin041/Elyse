import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkSchema() {
    const client = await pool.connect();

    try {
        console.log('🔍 Checking existing database schema...\n');

        // Check existing tables
        const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

        console.log(`Found ${tables.rows.length} existing tables:`);
        for (const row of tables.rows) {
            console.log(`  - ${row.table_name}`);

            // Get column details for important tables
            if (['categories', 'products', 'users'].includes(row.table_name)) {
                const columns = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position;
        `, [row.table_name]);

                console.log(`    Columns:`);
                columns.rows.forEach(col => {
                    console.log(`      ${col.column_name}: ${col.data_type}`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkSchema();
