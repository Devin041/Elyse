import bcrypt from 'bcryptjs';
import { query } from '../src/config/database.config';

async function createAdminUser() {
    try {
        const email = 'admin@elyse.com';
        const password = 'admin123';

        // Check if admin already exists
        const existing = await query('SELECT id FROM users WHERE email = $1', [email]);

        if (existing.rows.length > 0) {
            console.log('✅ Admin user already exists!');
            console.log('Email:', email);
            console.log('Password: admin123');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create admin user
        const result = await query(
            `INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, email, role`,
            [email, passwordHash, 'Admin', 'User', 'admin', true]
        );

        console.log('✅ Admin user created successfully!');
        console.log('Email:', result.rows[0].email);
        console.log('Password: admin123');
        console.log('Role:', result.rows[0].role);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
