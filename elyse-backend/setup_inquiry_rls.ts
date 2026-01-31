import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:HdEkQyOPgAIhMIeD@db.bcqsjztmpslvmkrbgevi.supabase.co:5432/postgres';

async function setupRLS() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to database');

        // Enable RLS
        await client.query(`ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;`);
        console.log('RLS enabled');

        // Drop existing policies if any
        await client.query(`DROP POLICY IF EXISTS "Allow public insert" ON contact_inquiries;`);
        await client.query(`DROP POLICY IF EXISTS "Allow authenticated read" ON contact_inquiries;`);
        await client.query(`DROP POLICY IF EXISTS "Allow service role all" ON contact_inquiries;`);
        console.log('Old policies dropped');

        // Create policy to allow anyone to insert (for contact form)
        await client.query(`
            CREATE POLICY "Allow public insert" ON contact_inquiries
            FOR INSERT
            TO anon, authenticated
            WITH CHECK (true);
        `);
        console.log('Public insert policy created');

        // Create policy to allow authenticated users to read (for admin)
        await client.query(`
            CREATE POLICY "Allow authenticated read" ON contact_inquiries
            FOR SELECT
            TO authenticated
            USING (true);
        `);
        console.log('Authenticated read policy created');

        // Create policy for service role to do everything
        await client.query(`
            CREATE POLICY "Allow service role all" ON contact_inquiries
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
        `);
        console.log('Service role all policy created');

        console.log('RLS setup complete!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

setupRLS();
