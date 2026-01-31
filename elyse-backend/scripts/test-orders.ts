import { OrderService } from '../src/api/services/order.service';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

async function testFetchOrders() {
    try {
        console.log('Testing Admin Fetch...');
        // Use any to bypass strict type checking for the test script
        const adminOrders = await OrderService.getOrders({} as any, undefined, true);
        console.log('Admin orders count:', adminOrders.length);

        if (adminOrders.length > 0) {
            console.log('First order summary:', {
                id: adminOrders[0].id,
                user_id: adminOrders[0].user_id,
                order_number: adminOrders[0].order_number,
                total: adminOrders[0].total_amount
            });

            const userId = adminOrders[0].user_id;
            console.log(`Testing User Fetch for ${userId}...`);
            const userOrders = await OrderService.getOrders({} as any, userId, false);
            console.log('User orders count:', userOrders.length);
        } else {
            console.log('No orders found in database.');
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testFetchOrders();
