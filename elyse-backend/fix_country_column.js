const { Client } = require('pg');
require('dotenv').config({ path: '.env.development' });

async function fixSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // Alter column length
        await client.query('ALTER TABLE user_addresses ALTER COLUMN country TYPE VARCHAR(100)');
        console.log('Successfully expanded country column to VARCHAR(100)');

    } catch (err) {
        console.error('Error fixing schema:', err.message);
    } finally {
        await client.end();
    }
}

fixSchema();
