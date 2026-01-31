import { query, transaction } from '../../config/database.config';
import { NotFoundError, ValidationError } from '../../utils/errors/AppError';
import logger from '../../utils/logger';
import type { AddToCartInput, UpdateCartItemInput } from '../validators/cart.validator';

/**
 * Shopping Cart Service
 * Manages cart operations for both authenticated and guest users
 */

interface CartItem {
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    variantId: string;
    variantSku: string;
    size?: string;
    color?: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    inventoryCount: number;
}

interface Cart {
    id: string;
    userId?: string;
    sessionId?: string;
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Get or create cart for user/session
async function getOrCreateCart(userId?: string, sessionId?: string): Promise<string> {
    if (!userId && !sessionId) {
        throw new ValidationError('Either userId or sessionId is required');
    }

    let result;

    if (userId) {
        // Get or create cart for authenticated user
        result = await query(
            `INSERT INTO carts (user_id, expires_at)
       VALUES ($1, NOW() + INTERVAL '30 days')
       ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
       WHERE carts.user_id = $1
       RETURNING id`,
            [userId]
        );

        if (result.rows.length === 0) {
            // Cart already exists, fetch it
            result = await query('SELECT id FROM carts WHERE user_id = $1', [userId]);
        }
    } else {
        // Get or create cart for guest
        result = await query(
            `INSERT INTO carts (session_id, expires_at)
       VALUES ($1, NOW() + INTERVAL '7 days')
       ON CONFLICT DO NOTHING
       RETURNING id`,
            [sessionId]
        );

        if (result.rows.length === 0) {
            // Cart already exists, fetch it
            result = await query('SELECT id FROM carts WHERE session_id = $1', [sessionId]);
        }
    }

    return result.rows[0].id;
}

// Calculate cart totals
function calculateCartTotals(items: CartItem[]): {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
} {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
    const shipping = subtotal >= 1000 ? 0 : 50; // Free shipping over ₹1000
    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total };
}

// Get cart with all items and totals
export async function getCart(userId?: string, sessionId?: string): Promise<Cart> {
    if (!userId && !sessionId) {
        return {
            id: '',
            items: [],
            itemCount: 0,
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0,
            expiresAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    const whereClause = userId ? 'c.user_id = $1' : 'c.session_id = $1';
    const param = userId || sessionId;

    const result = await query(
        `SELECT 
      c.id, c.user_id, c.session_id, c.expires_at, c.created_at, c.updated_at,
      json_agg(
        json_build_object(
          'id', ci.id,
          'productId', p.id,
          'productName', p.name,
          'productSlug', p.slug,
          'variantId', pv.id,
          'variantSku', pv.sku,
          'size', pv.size,
          'color', pv.color,
          'price', COALESCE(p.sale_price, p.base_price),
          'quantity', ci.quantity,
          'imageUrl', (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1),
          'inventoryCount', pv.stock_quantity,
          'inventory', pv.stock_quantity
        ) ORDER BY ci.added_at
      ) FILTER (WHERE ci.id IS NOT NULL) as items
    FROM carts c
    LEFT JOIN cart_items ci ON c.id = ci.cart_id
    LEFT JOIN products p ON ci.product_id = p.id
    LEFT JOIN product_variants pv ON ci.variant_id = pv.id
    WHERE ${whereClause} AND c.expires_at > NOW()
    GROUP BY c.id`,
        [param]
    );

    if (result.rows.length === 0) {
        // Return empty cart
        return {
            id: '',
            items: [],
            itemCount: 0,
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0,
            expiresAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    const cart = result.rows[0];
    const items = cart.items || [];
    const itemCount = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
    const totals = calculateCartTotals(items);

    return {
        id: cart.id,
        userId: cart.user_id,
        sessionId: cart.session_id,
        items,
        itemCount,
        ...totals,
        expiresAt: cart.expires_at,
        createdAt: cart.created_at,
        updatedAt: cart.updated_at,
    };
}

// Add item to cart
export async function addToCart(
    input: AddToCartInput,
    userId?: string,
    sessionId?: string
): Promise<Cart> {
    const { productId, variantId, quantity } = input;

    // Verify product and variant exist
    const productCheck = await query(
        `SELECT p.id, p.is_active, pv.stock_quantity as inventory_count
     FROM products p
     JOIN product_variants pv ON pv.product_id = p.id
     WHERE p.id = $1 AND pv.id = $2`,
        [productId, variantId]
    );

    if (productCheck.rows.length === 0) {
        throw new NotFoundError('Product or variant not found');
    }

    const product = productCheck.rows[0];

    if (!product.is_active) {
        throw new ValidationError('Product is not available');
    }

    if (product.inventory_count < quantity) {
        throw new ValidationError(
            `Only ${product.inventory_count} items available in stock`
        );
    }

    // Get or create cart
    const cartId = await getOrCreateCart(userId, sessionId);

    // Check if item already exists in cart
    const existingItem = await query(
        `SELECT id, quantity FROM cart_items 
     WHERE cart_id = $1 AND product_id = $2 AND variant_id = $3`,
        [cartId, productId, variantId]
    );

    if (existingItem.rows.length > 0) {
        // Update quantity
        const newQuantity = existingItem.rows[0].quantity + quantity;

        if (newQuantity > product.inventory_count) {
            throw new ValidationError(
                `Cannot add ${quantity} more. Only ${product.inventory_count} available.`
            );
        }

        await query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2',
            [newQuantity, existingItem.rows[0].id]
        );
    } else {
        // Add new item
        await query(
            `INSERT INTO cart_items (cart_id, product_id, variant_id, quantity)
       VALUES ($1, $2, $3, $4)`,
            [cartId, productId, variantId, quantity]
        );
    }

    // Update cart timestamp
    await query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);

    logger.info('Item added to cart', { cartId, productId, variantId, quantity });

    // Return updated cart
    return getCart(userId, sessionId);
}

// Update cart item quantity
export async function updateCartItem(
    cartItemId: string,
    input: UpdateCartItemInput,
    userId?: string,
    sessionId?: string
): Promise<Cart> {
    const { quantity } = input;

    // Verify cart item belongs to user
    const whereClause = userId
        ? 'c.user_id = $2'
        : 'c.session_id = $2';
    const param = userId || sessionId;

    const itemCheck = await query(
        `SELECT ci.id, ci.product_id, ci.variant_id, pv.stock_quantity as inventory_count
     FROM cart_items ci
     JOIN carts c ON ci.cart_id = c.id
     JOIN product_variants pv ON ci.variant_id = pv.id
     WHERE ci.id = $1 AND ${whereClause}`,
        [cartItemId, param]
    );

    if (itemCheck.rows.length === 0) {
        throw new NotFoundError('Cart item not found');
    }

    const item = itemCheck.rows[0];

    if (quantity === 0) {
        // Remove item
        await query('DELETE FROM cart_items WHERE id = $1', [cartItemId]);
        logger.info('Item removed from cart', { cartItemId });
    } else {
        // Check inventory
        if (quantity > item.inventory_count) {
            throw new ValidationError(
                `Only ${item.inventory_count} items available in stock`
            );
        }

        // Update quantity
        await query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2',
            [quantity, cartItemId]
        );
        logger.info('Cart item updated', { cartItemId, quantity });
    }

    // Return updated cart
    return getCart(userId, sessionId);
}

// Remove item from cart
export async function removeCartItem(
    cartItemId: string,
    userId?: string,
    sessionId?: string
): Promise<Cart> {
    const whereClause = userId ? 'c.user_id = $2' : 'c.session_id = $2';
    const param = userId || sessionId;

    const result = await query(
        `DELETE FROM cart_items
     USING carts c
     WHERE cart_items.cart_id = c.id
       AND cart_items.id = $1
       AND ${whereClause}
     RETURNING cart_items.id`,
        [cartItemId, param]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Cart item not found');
    }

    logger.info('Item removed from cart', { cartItemId });

    return getCart(userId, sessionId);
}

// Clear entire cart
export async function clearCart(userId?: string, sessionId?: string): Promise<void> {
    const whereClause = userId ? 'user_id = $1' : 'session_id = $1';
    const param = userId || sessionId;

    await query(
        `DELETE FROM cart_items
     WHERE cart_id IN (SELECT id FROM carts WHERE ${whereClause})`,
        [param]
    );

    logger.info('Cart cleared', { userId, sessionId });
}

// Merge guest cart into user cart (on login)
export async function mergeGuestCart(userId: string, sessionId: string): Promise<Cart> {
    await transaction(async (client) => {
        // Get guest cart items
        const guestCart = await client.query(
            `SELECT ci.product_id, ci.variant_id, ci.quantity
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE c.session_id = $1`,
            [sessionId]
        );

        if (guestCart.rows.length === 0) {
            return; // No guest cart to merge
        }

        // Get or create user cart
        const userCartId = await getOrCreateCart(userId);

        // Merge items
        for (const item of guestCart.rows) {
            const existing = await client.query(
                `SELECT id, quantity FROM cart_items
         WHERE cart_id = $1 AND product_id = $2 AND variant_id = $3`,
                [userCartId, item.product_id, item.variant_id]
            );

            if (existing.rows.length > 0) {
                // Update quantity
                await client.query(
                    'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
                    [item.quantity, existing.rows[0].id]
                );
            } else {
                // Add new item
                await client.query(
                    `INSERT INTO cart_items (cart_id, product_id, variant_id, quantity)
           VALUES ($1, $2, $3, $4)`,
                    [userCartId, item.product_id, item.variant_id, item.quantity]
                );
            }
        }

        // Delete guest cart
        await client.query('DELETE FROM carts WHERE session_id = $1', [sessionId]);

        logger.info('Guest cart merged into user cart', { userId, sessionId });
    });

    return getCart(userId);
}
