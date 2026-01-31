import bcrypt from 'bcryptjs';
import { query } from '../src/config/database.config';

async function updateUserToAdmin() {
    try {
        const email = 'adityaS41.joshi@gmail.com';

        // Check if user exists
        const existing = await query('SELECT id, role FROM users WHERE email = $1', [email.toLowerCase()]);

        if (existing.rows.length === 0) {
            console.log('❌ User not found. Creating new admin user...');

            const password = 'admin123';
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash(password, salt);

            const result = await query(
                `INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, email, role`,
                [email.toLowerCase(), passwordHash, 'Aditya', 'Joshi', 'admin', true]
            );

            console.log('✅ Admin user created!');
            console.log('Email:', result.rows[0].email);
            console.log('Password: admin123');
            console.log('Role:', result.rows[0].role);
        } else {
            // Update existing user to admin
            await query('UPDATE users SET role = $1 WHERE email = $2', ['admin', email.toLowerCase()]);
            console.log('✅ User updated to admin role!');
            console.log('Email:', email);
            console.log('Role: admin');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updateUserToAdmin();
