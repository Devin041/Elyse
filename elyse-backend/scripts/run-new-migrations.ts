import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
    const client = await pool.connect();

    try {
        console.log('🚀 Running new database migrations...\n');

        // Get migration files from new database folder
        const migrationDir = path.join(__dirname, '..', '..', 'database', 'migrations');
        const migrationFiles = [
            '001_core_tables.sql',
            '002_cart_orders.sql',
            '003_reviews_landing.sql'
        ];

        for (const file of migrationFiles) {
            const filePath = path.join(migrationDir, file);

            if (!fs.existsSync(filePath)) {
                console.log(`⚠️  Migration file not found: ${file}`);
                continue;
            }

            console.log(`📄 Running migration: ${file}...`);
            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                await client.query(sql);
                console.log(`✅ ${file} completed successfully\n`);
            } catch (error: any) {
                // Check if error is due to existing tables (which is okay)
                if (error.message.includes('already exists')) {
                    console.log(`ℹ️  ${file} - Tables already exist, skipping\n`);
                } else {
                    throw error;
                }
            }
        }

        // Verify tables were created
        console.log('🔍 Verifying tables...');
        const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

        console.log(`\n✅ Found ${result.rows.length} tables in database:`);
        result.rows.forEach((row: any) => {
            console.log(`   - ${row.table_name}`);
        });

        console.log('\n🎉 All migrations completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations()
    .then(() => {
        console.log('\n✅ Database setup complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
