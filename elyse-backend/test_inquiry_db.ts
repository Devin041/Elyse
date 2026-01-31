import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:HdEkQyOPgAIhMIeD@db.bcqsjztmpslvmkrbgevi.supabase.co:5432/postgres';

async function testInquiry() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to database');

        // Check if table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'contact_inquiries'
            )
        `);
        console.log('Table exists:', tableCheck.rows[0].exists);

        if (!tableCheck.rows[0].exists) {
            console.log('Creating table...');
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
            console.log('Table created');
        }

        // Test insert
        const result = await client.query(`
            INSERT INTO contact_inquiries (name, email, subject, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, ['Test User', 'test@example.com', 'Test Subject', 'This is a test message']);

        console.log('Insert successful:', result.rows[0]);

        // Get all inquiries
        const inquiries = await client.query('SELECT * FROM contact_inquiries ORDER BY created_at DESC');
        console.log('Total inquiries:', inquiries.rowCount);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

testInquiry();
