'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/types';

interface QuickAddOverlayProps {
    product: Product;
    isVisible: boolean;
    onAddToCart: (variantId: string, size: string) => void;
}

export function QuickAddOverlay({ product, isVisible, onAddToCart }: QuickAddOverlayProps) {
    const [showSizeSelector, setShowSizeSelector] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // Get unique available sizes from variants
    const uniqueSizesMap = new Map();
    product.variants.forEach(v => {
        const inStock = (v.inventoryCount !== undefined ? v.inventoryCount : v.inventory) > 0;
        if (inStock && v.size && !uniqueSizesMap.has(v.size)) {
            uniqueSizesMap.set(v.size, { size: v.size, id: v.id });
        }
    });
    const availableSizes = Array.from(uniqueSizesMap.values());

    // If product has no variants or only one variant, skip size selection
    const singleVariant = product.variants.length === 1 || availableSizes.length === 1;

    const handleSizeClick = async (variantId: string, size: string) => {
        setIsAddingToCart(true);
        await onAddToCart(variantId, size);

        // Reset after animation
        setTimeout(() => {
            setIsAddingToCart(false);
            setShowSizeSelector(false);
        }, 500);
    };

    const handleQuickAddClick = () => {
        if (singleVariant && availableSizes.length > 0) {
            const variant = availableSizes[0];
            handleSizeClick(variant.id, variant.size || 'One Size');
        } else {
            setShowSizeSelector(true);
        }
    };

    // Reset size selector when overlay becomes invisible
    if (!isVisible && showSizeSelector) {
        setShowSizeSelector(false);
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute bottom-0 left-0 right-0 p-4 z-20"
                    onMouseLeave={() => setShowSizeSelector(false)}
                >
                    {/* Stage 1: Quick Add Button */}
                    {!showSizeSelector && (
                        <motion.button
                            onMouseEnter={() => {
                                if (!singleVariant && availableSizes.length > 0) {
                                    setShowSizeSelector(true);
                                }
                            }}
                            onClick={handleQuickAddClick}
                            disabled={product.soldOut || isAddingToCart}
                            className="w-full bg-white text-neutral-900 py-2.5 px-4 text-sm font-medium shadow-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-30"
                        >
                            {isAddingToCart ? 'Adding...' : 'QUICK ADD'}
                        </motion.button>
                    )}

                    {/* Stage 2: Size Selector - Compact & Elegant */}
                    <AnimatePresence>
                        {showSizeSelector && !singleVariant && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: 10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: 10 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="bg-white shadow-lg overflow-hidden relative z-30"
                            >
                                {/* Size Buttons - Rizabella Style: Compact, Refined, No Label */}
                                <div className="p-3">
                                    <div className="flex flex-wrap gap-1.5 justify-center">
                                        {availableSizes.length > 0 ? (
                                            availableSizes.map((variant, index) => (
                                                <motion.button
                                                    key={variant.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{
                                                        duration: 0.15,
                                                        delay: index * 0.03,
                                                        ease: 'easeOut',
                                                    }}
                                                    onClick={() => handleSizeClick(variant.id, variant.size || 'One Size')}
                                                    disabled={isAddingToCart}
                                                    className="min-w-[36px] px-3 py-1 text-xs border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {variant.size || 'One Size'}
                                                </motion.button>
                                            ))
                                        ) : (
                                            <p className="text-xs text-neutral-500 text-center py-2 w-full">
                                                All sizes out of stock
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
