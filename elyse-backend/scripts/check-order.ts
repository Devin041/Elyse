
import { query } from '../src/config/database.config';

const orderId = process.argv[2];

if (!orderId) {
    console.error('Please provide an order ID');
    process.exit(1);
}

async function checkOrder() {
    try {
        console.log(`Checking for order: ${orderId}`);
        const result = await query('SELECT * FROM orders WHERE order_number = $1', [orderId]);

        if (result.rows.length > 0) {
            console.log('Order FOUND:', result.rows[0]);
        } else {
            console.log('Order NOT FOUND in database.');
            // Check if there are ANY orders
            const allOrders = await query('SELECT count(*) FROM orders');
            console.log(`Total orders in DB: ${allOrders.rows[0].count}`);
        }
    } catch (error) {
        console.error('Error checking order:', error);
    }
}

checkOrder();
