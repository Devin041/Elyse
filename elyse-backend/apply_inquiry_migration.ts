import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:HdEkQyOPgAIhMIeD@db.bcqsjztmpslvmkrbgevi.supabase.co:5432/postgres';

async function migrate() {
    const client = new Client({ connectionString });
    try {
        await client.connect();

        console.log('Applying migration: Create contact_inquiries table');

        await client.query(`
            CREATE TABLE IF NOT EXISTS contact_inquiries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created ON contact_inquiries(created_at DESC);
        `);

        console.log('Migration successful');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
