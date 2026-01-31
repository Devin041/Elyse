'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Badge } from '@/components/ui/Badge';
import { QuickAddOverlay } from './QuickAddOverlay';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useWishlistStore } from '@/store/wishlistStore';
import type { Product } from '@/types';
import { optimizeCloudinaryUrl, PLACEHOLDER_IMAGE } from '@/lib/utils/image';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [touchCount, setTouchCount] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
    const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
    const isWishlisted = isInWishlist(product.id);
    const addItem = useCartStore((state) => state.addItem);
    const setShowNotification = useUIStore((state) => state.setShowNotification);
    const setRecentlyAddedItem = useUIStore((state) => state.setRecentlyAddedItem);
    const setCartDrawerOpen = useUIStore((state) => state.setCartDrawerOpen);

    // Detect touch device and mount state
    useEffect(() => {
        setMounted(true);
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    // Automatic image cycling on hover
    useEffect(() => {
        if (isHovered && product.images.length > 1 && !isTouchDevice) {
            const interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
            }, 1500); // Change every 1.5 seconds

            return () => clearInterval(interval);
        } else {
            setCurrentImageIndex(0); // Reset to first image when not hovering
        }
    }, [isHovered, product.images.length, isTouchDevice]);

    // Handle touch interactions (mobile)
    const handleTouch = () => {
        if (isTouchDevice) {
            if (touchCount === 0) {
                setIsHovered(true);
                setTouchCount(1);
            }
            // Second touch will be handled by QuickAddOverlay
        }
    };

    // Reset touch count when hover ends
    useEffect(() => {
        if (!isHovered) {
            setTouchCount(0);
        }
    }, [isHovered]);

    // Add to cart handler - Rizabella style (notification only, NO auto-open drawer)
    const handleAddToCart = async (variantId: string, size: string) => {
        const variant = product.variants.find(v => v.id === variantId);
        if (variant) {
            const cartItem = {
                id: `${product.id}-${variantId}`,
                productId: product.id,
                productSlug: product.slug,
                variantId: variant.id,
                name: product.name,
                price: Number(product.salePrice || product.sale_price || product.price || product.base_price || 0),
                size: size,
                color: product.color,
                image: optimizeCloudinaryUrl(typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url, 600),
                quantity: 1,
                variant: variant,
            };

            // Add to cart
            addItem(cartItem);

            // Show notification bar (Rizabella style - notification ONLY, no drawer)
            setRecentlyAddedItem(cartItem);
            setShowNotification(true);

            // Cart drawer will open ONLY when user clicks "VIEW CART" button
        }
    };

    return (
        <div
            className="group relative"
            onMouseEnter={() => !isTouchDevice && setIsHovered(true)}
            onMouseLeave={() => !isTouchDevice && setIsHovered(false)}
            onClick={handleTouch}
        >
            <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-200 relative">
                <Link href={`/products/${product.slug}`} onClick={(e) => {
                    // Prevent navigation if clicking on Quick Add area
                    if (isHovered && touchCount > 0) {
                        e.preventDefault();
                    }
                }}>
                    {/* Render all images for cycling */}
                    {product.images?.map((image: any, index: number) => (
                        <Image
                            key={index}
                            src={imageErrors[index] ? PLACEHOLDER_IMAGE : optimizeCloudinaryUrl(image.url || image, 800)}
                            alt={`${product.name} - View ${index + 1}`}
                            fill
                            className={`object-cover object-center absolute inset-0 transition-opacity duration-400 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                                }`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={index === 0}
                            onError={() => setImageErrors(prev => ({ ...prev, [index]: true }))}
                        />
                    ))}
                </Link>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
                    {product.soldOut && <Badge variant="secondary">Sold Out</Badge>}
                    {product.badge && <Badge variant="new">{product.badge}</Badge>}
                    {product.salePrice && <Badge variant="sale">Sale</Badge>}
                </div>

                {/* Wishlist Icon - Rizabella style */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isWishlisted) {
                            removeFromWishlist(product.id);
                        } else {
                            addToWishlist(product.id);
                        }
                    }}
                    className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform duration-200"
                    aria-label={mounted && isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    {mounted && isWishlisted ? (
                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                        <HeartIcon className="w-5 h-5 text-neutral-700" />
                    )}
                </button>

                {/* Quick Add Overlay */}
                <QuickAddOverlay
                    product={product}
                    isVisible={isHovered}
                    onAddToCart={handleAddToCart}
                />
            </div>

            <div className="mt-4 flex justify-between">
                <div>
                    <h3 className="text-sm text-neutral-700">
                        <Link href={`/products/${product.slug}`}>
                            <span aria-hidden="true" className="absolute inset-0" />
                            {product.name}
                        </Link>
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">{product.category_name || product.category}</p>
                </div>
                <div className="text-right">
                    {(product.salePrice || product.sale_price) ? (
                        <>
                            <p className="text-sm font-medium text-neutral-900">₹{(product.salePrice || product.sale_price).toLocaleString()}</p>
                            <p className="text-sm text-neutral-500 line-through">₹{(product.price || product.base_price).toLocaleString()}</p>
                        </>
                    ) : (
                        <p className="text-sm font-medium text-neutral-900">₹{(product.price || product.base_price || 0).toLocaleString()}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
