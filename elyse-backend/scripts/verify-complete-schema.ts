import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

interface SchemaIssue {
    severity: 'ERROR' | 'WARNING' | 'INFO';
    table: string;
    issue: string;
    details?: string;
}

async function verifySchema() {
    const client = await pool.connect();
    const issues: SchemaIssue[] = [];

    try {
        console.log('🔍 COMPREHENSIVE SCHEMA VERIFICATION\n');
        console.log('='.repeat(60));

        // 1. Check all tables exist
        console.log('\n📊 1. CHECKING TABLES...\n');
        const tables = await client.query(`
      SELECT table_name, 
             (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

        console.log(`   Found ${tables.rows.length} tables:\n`);

        const requiredTables = [
            'users', 'categories', 'products', 'product_variants',
            'product_images', 'orders', 'order_items',
            'product_reviews', 'blog_posts',
            'hero_sections', 'occasion_categories', 'product_sections', 'brand_story',
            'gift_cards_banner', 'appointment_cta', 'product_carousel', 'carousel_tabs',
            'blog_section_config', 'featured_blog_posts', 'profiles', 'stock_notifications'
        ];

        const existingTables = tables.rows.map((r: any) => r.table_name);

        tables.rows.forEach((row: any) => {
            const isRequired = requiredTables.includes(row.table_name);
            const marker = isRequired ? '✓' : ' ';
            console.log(`   ${marker} ${row.table_name.padEnd(30)} (${row.column_count} columns)`);
        });

        // Check for missing required tables
        const missingTables = requiredTables.filter(t => !existingTables.includes(t));
        if (missingTables.length > 0) {
            missingTables.forEach(table => {
                issues.push({
                    severity: 'WARNING',
                    table,
                    issue: 'Missing required table'
                });
            });
        }

        // 2. Check Foreign Key Relationships
        console.log('\n\n🔗 2. CHECKING FOREIGN KEY RELATIONSHIPS...\n');
        const foreignKeys = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
     WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `);

        console.log(`   Found ${foreignKeys.rows.length} foreign key relationships\n`);

        // 3. Check for Data Type Conflicts in Foreign Keys
        console.log('\n🎯 3. CHECKING FOREIGN KEY TYPE CONSISTENCY...\n');

        const typeChecks = await client.query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        c1.udt_name as local_udt,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        c2.udt_name as foreign_udt
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      JOIN information_schema.columns c1
        ON c1.table_name = tc.table_name AND c1.column_name = kcu.column_name AND c1.table_schema = 'public'
      JOIN information_schema.columns c2
        ON c2.table_name = ccu.table_name AND c2.column_name = ccu.column_name AND c2.table_schema = 'public'
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND c1.udt_name != c2.udt_name;
    `);

        if (typeChecks.rows.length > 0) {
            console.log('   ⚠️  TYPE MISMATCHES FOUND:\n');
            typeChecks.rows.forEach((row: any) => {
                console.log(`   ${row.table_name}.${row.column_name} (${row.local_udt}) → ${row.foreign_table_name}.${row.foreign_column_name} (${row.foreign_udt})`);
                issues.push({
                    severity: 'ERROR',
                    table: row.table_name,
                    issue: 'Foreign key type mismatch',
                    details: `${row.column_name} (${row.local_udt}) references ${row.foreign_table_name}.${row.foreign_column_name} (${row.foreign_udt})`
                });
            });
        } else {
            console.log('   ✅ All foreign key types match!');
        }

        // 4. Check Landing Page Tables
        console.log('\n\n🎨 4. VERIFYING LANDING PAGE TABLES...\n');

        const landingPageTables = [
            'hero_sections', 'occasion_categories', 'product_sections', 'brand_story',
            'gift_cards_banner', 'appointment_cta', 'product_carousel', 'carousel_tabs',
            'blog_section_config', 'featured_blog_posts'
        ];

        landingPageTables.forEach(table => {
            const exists = existingTables.includes(table);
            const marker = exists ? '✅' : '❌';
            console.log(`   ${marker} ${table}`);
            if (!exists) {
                issues.push({
                    severity: 'ERROR',
                    table,
                    issue: 'Landing page table missing'
                });
            }
        });

        // FINAL REPORT
        console.log('\n\n' + '='.repeat(60));
        console.log('📋 VERIFICATION SUMMARY\n');

        const errors = issues.filter(i => i.severity === 'ERROR');
        const warnings = issues.filter(i => i.severity === 'WARNING');

        if (errors.length === 0 && warnings.length === 0) {
            console.log('✅ NO ISSUES FOUND! Schema is clean and consistent.\n');
            console.log('   ✓ All foreign keys have matching types');
            console.log('   ✓ All required tables present');
            console.log('   ✓ Landing page tables integrated');
        } else {
            if (errors.length > 0) {
                console.log(`❌ ERRORS: ${errors.length}\n`);
                errors.forEach(err => {
                    console.log(`   [${err.table}] ${err.issue}`);
                    if (err.details) console.log(`      ${err.details}`);
                });
            }

            if (warnings.length > 0) {
                console.log(`\n⚠️  WARNINGS: ${warnings.length}\n`);
                warnings.forEach(warn => {
                    console.log(`   [${warn.table}] ${warn.issue}`);
                });
            }
        }

        console.log('\n' + '='.repeat(60));

        return { issues, errors, warnings };

    } catch (error) {
        console.error('❌ Verification failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

verifySchema()
    .then(({ errors, warnings }) => {
        console.log('\n✅ Schema verification complete!');
        if (warnings.length > 0) {
            console.log(`   (${warnings.length} warnings found)`);
        }
        process.exit(errors.length > 0 ? 1 : 0);
    })
    .catch((error) => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
