import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function listAllUsers() {
    try {
        console.log('--- AUTH USERS ---');
        const authRes = await pool.query('SELECT id, email FROM auth.users');
        console.table(authRes.rows);

        console.log('\n--- PUBLIC PROFILES ---');
        const profRes = await pool.query('SELECT id, email FROM public.profiles');
        console.table(profRes.rows);

        console.log('\n--- ORDERS WITHOUT PROFILE LINK ---');
        const orderRes = await pool.query('SELECT count(*) FROM orders WHERE user_id IS NULL');
        console.log('Orders with NULL user_id:', orderRes.rows[0].count);

    } catch (error) {
        console.error('List failed:', error);
    } finally {
        await pool.end();
    }
}

listAllUsers();
