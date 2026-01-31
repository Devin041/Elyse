"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useCart, CartItem, CartSummary } from '@/hooks/useCart';

interface CartContextType {
    cart: CartItem[];
    isLoading: boolean;
    addToCart: (item: Omit<CartItem, 'id'>) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getCartSummary: () => CartSummary;
    isInCart: (productId: string, variantId?: string) => boolean;
    getItemQuantity: (productId: string, variantId?: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const cart = useCart();

    return (
        <CartContext.Provider value={cart}>
            {children}
        </CartContext.Provider>
    );
}

export function useCartContext() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCartContext must be used within a CartProvider');
    }
    return context;
}
