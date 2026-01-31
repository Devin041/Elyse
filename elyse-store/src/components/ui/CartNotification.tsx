'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';

/**
 * Rizabella-style top notification bar
 * Shows when product is added to cart with slide-down animation
 */

export function CartNotification() {
    const showNotification = useUIStore((state) => state.showNotification);
    const recentlyAddedItem = useUIStore((state) => state.recentlyAddedItem);
    const setShowNotification = useUIStore((state) => state.setShowNotification);
    const setCartDrawerOpen = useUIStore((state) => state.setCartDrawerOpen);

    // Auto-dismiss after 4 seconds
    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [showNotification, setShowNotification]);

    if (!recentlyAddedItem) return null;

    return (
        <AnimatePresence>
            {showNotification && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md text-black shadow-xl border-b border-black/5"
                >
                    <div className="container-premium py-4 px-4 flex items-center gap-4 relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowNotification(false)}
                            className="flex-shrink-0 hover:bg-black/5 rounded-full p-1.5 transition-colors absolute left-4 text-black/50 hover:text-black"
                            aria-label="Close notification"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>

                        {/* Product Info - Centered */}
                        <div className="flex items-center justify-center gap-4 flex-1">
                            {/* Product Thumbnail */}
                            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-black/5 shadow-md bg-white flex-shrink-0">
                                <Image
                                    src={recentlyAddedItem.image}
                                    alt={recentlyAddedItem.name}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                />
                            </div>

                            {/* Product Details */}
                            <div className="min-w-0 pr-12 lg:pr-0">
                                <p className="text-sm font-bold tracking-widest leading-tight text-black">
                                    {recentlyAddedItem.name.toUpperCase()} - {recentlyAddedItem.size}
                                </p>
                                <p className="text-[10px] tracking-[0.2em] font-medium text-black/50">JUST ADDED TO YOUR CART</p>
                            </div>
                        </div>

                        {/* View Cart Button */}
                        <button
                            onClick={() => {
                                setShowNotification(false);
                                setCartDrawerOpen(true);
                            }}
                            className="flex-shrink-0 bg-black text-white px-8 py-2.5 text-xs font-bold tracking-widest hover:bg-stone-800 transition-all rounded shadow-lg absolute right-4"
                        >
                            VIEW CART
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
