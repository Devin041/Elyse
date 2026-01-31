import { query } from '../../config/database.config';
import { AppError, NotFoundError } from '../../utils/errors/AppError';
import logger from '../../utils/logger';
import { CreateOrderInput, UpdateOrderStatusInput, GetOrdersQuery } from '../validators/order.validator';

export class OrderService {
    /**
     * Create new order from cart
     */
    static async createOrder(userId: string, input: CreateOrderInput) {
        const client = await (await import('../../config/database.config')).default.connect();

        try {
            await client.query('BEGIN');

            // Calculate totals
            let subtotal = 0;
            const orderItems = [];

            for (const item of input.items) {
                const variantResult = await client.query(
                    `SELECT pv.*, p.base_price, p.sale_price, p.name as product_name
           FROM product_variants pv
           JOIN products p ON p.id = pv.product_id
           WHERE pv.id = $1 AND p.is_active = true`,
                    [item.variantId]
                );

                if (variantResult.rows.length === 0) {
                    throw new NotFoundError('Product variant not found or inactive');
                }

                const variant = variantResult.rows[0];

                if (variant.stock_quantity < item.quantity) {
                    throw new AppError(`Insufficient stock for ${variant.product_name}`, 400);
                }

                const price = variant.sale_price || variant.base_price;
                subtotal += price * item.quantity;

                orderItems.push({
                    ...item,
                    price,
                    productName: variant.product_name,
                    sku: variant.sku,
                });
            }

            // Calculate tax and shipping
            const taxRate = 0.18; // 18% GST
            const taxAmount = Math.round(subtotal * taxRate);
            const shippingCost = subtotal >= 1000 ? 0 : 50;
            const totalAmount = subtotal + taxAmount + shippingCost;

            // Generate order number
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            // Create order
            const orderResult = await client.query(
                `INSERT INTO orders (
          user_id, order_number, subtotal, discount_amount, shipping_charge, total_amount,
          order_status, payment_status, payment_method, customer_notes, customer_email,
          shipping_full_name, shipping_phone, shipping_address_line1, shipping_address_line2,
          shipping_city, shipping_state, shipping_pincode
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *`,
                [
                    userId,
                    orderNumber,
                    subtotal,
                    0, // discount_amount
                    shippingCost,
                    totalAmount,
                    'pending',
                    'pending',
                    input.paymentMethod,
                    input.notes || null,
                    null, // customer_email (should probably get from user table)
                    null, // shipping_full_name (should come from input or address)
                    null, // shipping_phone
                    null, // shipping_address_line1
                    null, // shipping_address_line2
                    null, // shipping_city
                    null, // shipping_state
                    null, // shipping_pincode
                ]
            );

            const order = orderResult.rows[0];

            // Create order items and update inventory
            for (const item of orderItems) {
                await client.query(
                    `INSERT INTO order_items (
            order_id, product_id, variant_id, quantity, price_at_purchase, product_name, variant_sku
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [order.id, item.productId, item.variantId, item.quantity, item.price, item.productName, item.sku]
                );

                // Reduce inventory
                await client.query(
                    `UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
                    [item.quantity, item.variantId]
                );
            }

            await client.query('COMMIT');

            logger.info('Order created', { orderId: order.id, userId, orderNumber });
            return await this.getOrderById(order.id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get all orders (admin) or user's orders
     */
    static async getOrders(filters: GetOrdersQuery, userId?: string, isAdmin = false) {
        const { limit = 20, offset = 0 } = filters;
        let queryText = `
      SELECT 
        o.*,
        p.email as user_email,
        COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN profiles p ON p.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE 1=1
    `;
        const params: any[] = [];
        let paramCount = 1;

        // Filter by user if not admin
        if (!isAdmin && userId) {
            queryText += ` AND o.user_id = $${paramCount}`;
            params.push(userId);
            paramCount++;
        }

        // Admin filters
        if (filters.status) {
            queryText += ` AND o.order_status = $${paramCount}`;
            params.push(filters.status);
            paramCount++;
        }

        if (filters.paymentStatus) {
            queryText += ` AND o.payment_status = $${paramCount}`;
            params.push(filters.paymentStatus);
            paramCount++;
        }

        if (filters.userId) {
            queryText += ` AND o.user_id = $${paramCount}`;
            params.push(filters.userId);
            paramCount++;
        }

        queryText += ` GROUP BY o.id, p.email ORDER BY o.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await query(queryText, params);

        // Fetch items for each order to include images
        const ordersWithItems = [];
        for (const row of result.rows) {
            const itemsResult = await query(
                `SELECT 
                    oi.*, 
                    pv.size, 
                    pv.color,
                    (SELECT image_url FROM product_images WHERE product_id = oi.product_id ORDER BY is_primary DESC, created_at ASC LIMIT 1) as image_url
                 FROM order_items oi
                 LEFT JOIN product_variants pv ON pv.id = oi.variant_id
                 WHERE oi.order_id = $1`,
                [row.id]
            );

            ordersWithItems.push({
                ...row,
                status: row.order_status, // Map for frontend compatibility
                items: itemsResult.rows,
                shipping_address: {
                    full_name: row.shipping_full_name,
                    phone: row.shipping_phone,
                    address_line1: row.shipping_address_line1,
                    address_line2: row.shipping_address_line2,
                    city: row.shipping_city,
                    state: row.shipping_state,
                    pincode: row.shipping_pincode,
                    landmark: row.shipping_landmark
                },
                billing_address: null
            });
        }

        return ordersWithItems;
    }

    /**
     * Get order by ID
     */
    static async getOrderById(orderId: string, userId?: string, isAdmin = false) {
        const orderResult = await query(
            `SELECT o.*, p.email as user_email
       FROM orders o
       LEFT JOIN profiles p ON p.id = o.user_id
       WHERE o.id = $1 ${!isAdmin && userId ? 'AND o.user_id = $2' : ''}`,
            !isAdmin && userId ? [orderId, userId] : [orderId]
        );

        if (orderResult.rows.length === 0) {
            throw new NotFoundError('Order not found');
        }

        const order = orderResult.rows[0];

        // Get order items
        const itemsResult = await query(
            `SELECT 
                oi.*, 
                pv.size, 
                pv.color,
                (SELECT image_url FROM product_images WHERE product_id = oi.product_id ORDER BY is_primary DESC, created_at ASC LIMIT 1) as image_url
       FROM order_items oi
       LEFT JOIN product_variants pv ON pv.id = oi.variant_id
       WHERE oi.order_id = $1`,
            [orderId]
        );

        return {
            ...order,
            status: order.order_status, // Map for frontend compatibility
            items: itemsResult.rows,
            shipping_address: {
                full_name: order.shipping_full_name,
                phone: order.shipping_phone,
                address_line1: order.shipping_address_line1,
                address_line2: order.shipping_address_line2,
                city: order.shipping_city,
                state: order.shipping_state,
                pincode: order.shipping_pincode,
                landmark: order.shipping_landmark
            },
            billing_address: null
        };
    }

    /**
     * Update order status
     */
    static async updateOrderStatus(orderId: string, input: UpdateOrderStatusInput) {
        const result = await query(
            `UPDATE orders SET order_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [input.status, orderId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Order not found');
        }

        logger.info('Order status updated', { orderId, status: input.status });
        return result.rows[0];
    }

    /**
     * Update payment status
     */
    static async updatePaymentStatus(orderId: string, paymentStatus: string, paymentId?: string) {
        const result = await query(
            `UPDATE orders SET payment_status = $1, payment_id = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
            [paymentStatus, paymentId || null, orderId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Order not found');
        }

        return result.rows[0];
    }

    /**
     * Cancel order
     */
    static async cancelOrder(orderId: string, userId?: string, isAdmin = false) {
        const client = await (await import('../../config/database.config')).default.connect();

        try {
            await client.query('BEGIN');

            // Get order
            const orderResult = await client.query(
                `SELECT * FROM orders WHERE id = $1 ${!isAdmin && userId ? 'AND user_id = $2' : ''}`,
                !isAdmin && userId ? [orderId, userId] : [orderId]
            );

            if (orderResult.rows.length === 0) {
                throw new NotFoundError('Order not found');
            }

            const order = orderResult.rows[0];

            if (order.order_status === 'delivered' || order.order_status === 'cancelled') {
                throw new AppError('Cannot cancel delivered or already cancelled orders', 400);
            }

            // Restore inventory
            const itemsResult = await client.query(
                `SELECT variant_id, quantity FROM order_items WHERE order_id = $1`,
                [orderId]
            );

            for (const item of itemsResult.rows) {
                await client.query(
                    `UPDATE product_variants SET stock_quantity = stock_quantity + $1 WHERE id = $2`,
                    [item.quantity, item.variant_id]
                );
            }

            // Update order status
            await client.query(
                `UPDATE orders SET order_status = 'cancelled', updated_at = NOW() WHERE id = $1`,
                [orderId]
            );

            await client.query('COMMIT');

            logger.info('Order cancelled', { orderId });
            return await this.getOrderById(orderId);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
