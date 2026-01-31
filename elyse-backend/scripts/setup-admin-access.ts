import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function makeUserAdmin() {
    const client = await pool.connect();

    try {
        console.log('👤 Setting up admin access...\n');

        // Check if there are any users
        const users = await client.query('SELECT id, email, role FROM users LIMIT 5');

        if (users.rows.length === 0) {
            console.log('ℹ️  No users found in database');
            console.log('\n📝 Next steps:');
            console.log('1. Register a user through the frontend');
            console.log('2. Run this script again with admin email');
            console.log('3. Or create user directly in Supabase dashboard');
            return;
        }

        console.log(`Found ${users.rows.length} existing users:`);
        users.rows.forEach((user, i) => {
            console.log(`${i + 1}. ${user.email} (${user.role || 'customer'}) - ID: ${user.id.slice(0, 8)}...`);
        });

        // Set first user as admin
        const firstUser = users.rows[0];

        if (firstUser.role === 'admin') {
            console.log(`\n✅ ${firstUser.email} is already an admin`);
        } else {
            await client.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', firstUser.id]);
            console.log(`\n✅ ${firstUser.email} is now an admin!`);
        }

        console.log('\n📧 Admin Credentials:');
        console.log(`   Email: ${firstUser.email}`);
        console.log(`   (Use the password you registered with)`);

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

makeUserAdmin()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
