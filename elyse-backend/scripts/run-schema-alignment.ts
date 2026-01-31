import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runSchemaAlignment() {
    const client = await pool.connect();

    try {
        console.log('🔧 Running Schema Alignment Migration...\n');

        const migrationFile = path.join(__dirname, '..', '..', 'database', 'migrations', '005_schema_alignment.sql');

        if (!fs.existsSync(migrationFile)) {
            throw new Error('Migration file not found: 005_schema_alignment.sql');
        }

        console.log('📄 Executing: 005_schema_alignment.sql\n');
        const sql = fs.readFileSync(migrationFile, 'utf8');

        await client.query(sql);

        console.log('✅ Schema alignment completed successfully!\n');

        // Verify updates
        console.log('🔍 Verifying schema updates...\n');

        // Check products table
        const productsColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND table_schema = 'public'
      AND column_name IN ('subcategory_id')
    `);

        if (productsColumns.rows.length > 0) {
            console.log('   ✓ products.subcategory_id added');
        }

        // Check variants table
        const variantsColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'product_variants' AND table_schema = 'public'
      AND column_name IN ('stock_quantity', 'color_id', 'size_id')
    `);

        console.log(`   ✓ product_variants: ${variantsColumns.rows.length} new columns added`);

        // Check new tables
        const newTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('product_colors', 'product_sizes')
      ORDER BY table_name
    `);

        console.log(`   ✓ New tables created: ${newTables.rows.length}`);
        newTables.rows.forEach((row: any) => {
            console.log(`      - ${row.table_name}`);
        });

        // Check sizes inserted
        const sizesCount = await client.query(`
      SELECT COUNT(*) as count FROM product_sizes
    `);

        console.log(`   ✓ Standard sizes inserted: ${sizesCount.rows[0].count}\n`);

        console.log('═'.repeat(60));
        console.log('✅ SCHEMA ALIGNMENT COMPLETE!');
        console.log('═'.repeat(60));

    } catch (error: any) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runSchemaAlignment()
    .then(() => {
        console.log('\n✅ Schema is now aligned with comprehensive architecture!');
        console.log('   You can now run product seeders successfully.\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
