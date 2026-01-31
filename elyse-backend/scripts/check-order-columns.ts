import { query } from '../src/config/database.config';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

async function testSchema() {
    try {
        const res = await query('SELECT * FROM orders LIMIT 1');
        if (res.rows.length > 0) {
            console.log('Order columns found:', Object.keys(res.rows[0]));
            console.log('First order data:', res.rows[0]);
        } else {
            console.log('No orders found.');
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testSchema();
