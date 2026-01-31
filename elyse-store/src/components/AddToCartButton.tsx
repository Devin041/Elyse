"use client";

import { useState } from 'react';
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCartContext } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

interface AddToCartButtonProps {
    productId: string;
    productName: string;
    productSlug: string;
    price: number;
    imageUrl?: string;
    variantId?: string;
    variantSku?: string;
    size?: string;
    color?: string;
    requiresVariant?: boolean;
    selectedSize?: string;
    selectedColor?: string;
    className?: string;
    disabled?: boolean;
}

export default function AddToCartButton({
    productId,
    productName,
    productSlug,
    price,
    imageUrl,
    variantId,
    variantSku,
    size,
    color,
    requiresVariant = false,
    selectedSize,
    selectedColor,
    className = '',
    disabled = false,
}: AddToCartButtonProps) {
    const { addToCart, isInCart } = useCartContext();
    const [isAdding, setIsAdding] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    const handleAddToCart = async () => {
        // Validate variant selection if required
        if (requiresVariant && (!selectedSize || !selectedColor)) {
            toast.error('Please select size and color');
            return;
        }

        setIsAdding(true);

        try {
            addToCart({
                productId,
                productName,
                productSlug,
                price,
                quantity: 1,
                imageUrl,
                variantId,
                variantSku,
                size: selectedSize || size,
                color: selectedColor || color,
            });

            // Show success state
            setJustAdded(true);
            toast.success(`${productName} added to cart`);

            // Reset success state after 2 seconds
            setTimeout(() => {
                setJustAdded(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to add to cart:', error);
            toast.error('Failed to add to cart');
        } finally {
            setIsAdding(false);
        }
    };

    const isItemInCart = isInCart(productId, variantId);

    return (
        <button
            onClick={handleAddToCart}
            disabled={disabled || isAdding || justAdded}
            className={`
                inline-flex items-center justify-center px-6 py-3 
                border border-transparent text-base font-medium rounded-md 
                transition-all duration-200
                ${justAdded
                    ? 'bg-green-600 text-white'
                    : 'bg-black text-white hover:bg-gray-800'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
        >
            {isAdding ? (
                <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                </>
            ) : justAdded ? (
                <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Added to Cart
                </>
            ) : (
                <>
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    {isItemInCart ? 'Add Again' : 'Add to Cart'}
                </>
            )}
        </button>
    );
}
