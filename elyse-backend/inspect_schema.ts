import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:HdEkQyOPgAIhMIeD@db.bcqsjztmpslvmkrbgevi.supabase.co:5432/postgres';

async function inspectSchema() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log('--- Existing Tables ---');
        const tablesRes = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log(tablesRes.rows.map(r => r.tablename).join(', '));

        for (const table of tablesRes.rows.map(r => r.tablename)) {
            if (table.includes('image')) {
                console.log(`\n--- Schema for ${table} ---`);
                const colsRes = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
                console.log(JSON.stringify(colsRes.rows, null, 2));
            }
        }

    } finally {
        await client.end();
    }
}

inspectSchema();
