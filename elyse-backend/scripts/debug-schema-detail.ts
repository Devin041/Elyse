import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function debugSchemaDetail() {
    try {
        console.log('--- Checking for Tables ---');
        const tablesRes = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'profiles', 'orders')
        `);
        console.table(tablesRes.rows);

        console.log('\n--- Checking Orders Foreign Keys ---');
        const fkRes = await pool.query(`
            SELECT
                tc.table_schema, 
                tc.constraint_name, 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_schema AS foreign_table_schema,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='orders';
        `);
        console.table(fkRes.rows);

        console.log('\n--- Checking Profiles columns ---');
        const profilesCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles'");
        console.table(profilesCols.rows);

    } catch (error) {
        console.error('Debug failed:', error);
    } finally {
        await pool.end();
    }
}

debugSchemaDetail();
