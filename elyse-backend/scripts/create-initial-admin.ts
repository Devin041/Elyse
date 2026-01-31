import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function createAdminUser() {
    const client = await pool.connect();

    try {
        console.log('👤 Creating admin user...\n');

        const adminEmail = 'admin@elyse.com';
        const adminPassword = 'admin123'; // Change this later!

        // Check if admin already exists
        const existing = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [adminEmail]
        );

        if (existing.rows.length > 0) {
            console.log('ℹ️  Admin user already exists');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   ID: ${existing.rows[0].id}`);

            // Make sure they're admin
            await client.query(
                'UPDATE users SET role = $1 WHERE email = $2',
                ['admin', adminEmail]
            );
            console.log('✅ Role updated to admin');

        } else {
            // Hash password
            const passwordHash = await bcrypt.hash(adminPassword, 10);

            // Create admin user
            const result = await client.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [adminEmail, passwordHash, 'Admin', 'User', 'admin', true]);

            console.log('✅ Admin user created successfully!');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}`);
            console.log(`   ID: ${result.rows[0].id}`);
            console.log('\n⚠️  IMPORTANT: Change this password after first login!');
        }

    } catch (error) {
        console.error('❌ Error creating admin:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

createAdminUser()
    .then(() => {
        console.log('\n✅ Admin setup complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
