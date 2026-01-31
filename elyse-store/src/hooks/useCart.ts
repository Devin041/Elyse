import { useState, useEffect } from 'react';

export interface CartItem {
    id: string; // Unique identifier for cart item
    productId: string;
    productName: string;
    productSlug: string;
    variantId?: string;
    variantSku?: string;
    size?: string;
    color?: string;
    price: number; // Price at time of adding to cart
    quantity: number;
    imageUrl?: string;
}

export interface CartSummary {
    subtotal: number;
    itemCount: number;
    items: CartItem[];
}

const CART_STORAGE_KEY = 'elyse_cart';

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Failed to load cart from localStorage:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (!isLoading) {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            } catch (error) {
                console.error('Failed to save cart to localStorage:', error);
            }
        }
    }, [cart, isLoading]);

    // Add item to cart
    const addToCart = (item: Omit<CartItem, 'id'>) => {
        setCart((prevCart) => {
            // Check if item already exists (same product + variant)
            const existingItemIndex = prevCart.findIndex(
                (cartItem) =>
                    cartItem.productId === item.productId &&
                    cartItem.variantId === item.variantId
            );

            if (existingItemIndex > -1) {
                // Update quantity if item exists
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex].quantity += item.quantity;
                return updatedCart;
            } else {
                // Add new item
                const newItem: CartItem = {
                    ...item,
                    id: `${item.productId}-${item.variantId || 'no-variant'}-${Date.now()}`,
                };
                return [...prevCart, newItem];
            }
        });
    };

    // Remove item from cart
    const removeFromCart = (itemId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    };

    // Update item quantity
    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    };

    // Clear entire cart
    const clearCart = () => {
        setCart([]);
    };

    // Get cart summary
    const getCartSummary = (): CartSummary => {
        const subtotal = cart.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
        const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

        return {
            subtotal,
            itemCount,
            items: cart,
        };
    };

    // Check if product is in cart
    const isInCart = (productId: string, variantId?: string): boolean => {
        return cart.some(
            (item) =>
                item.productId === productId &&
                (variantId ? item.variantId === variantId : !item.variantId)
        );
    };

    // Get item quantity
    const getItemQuantity = (productId: string, variantId?: string): number => {
        const item = cart.find(
            (item) =>
                item.productId === productId &&
                (variantId ? item.variantId === variantId : !item.variantId)
        );
        return item?.quantity || 0;
    };

    return {
        cart,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartSummary,
        isInCart,
        getItemQuantity,
    };
}
