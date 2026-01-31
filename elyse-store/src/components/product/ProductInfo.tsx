'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SizeGuideModal } from '@/components/product/SizeGuideModal';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import type { Product } from '@/types';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon, PlusIcon, MinusIcon, ShareIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useWishlistStore } from '@/store/wishlistStore';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

interface ProductInfoProps {
    product: Product;
    selectedColor?: string;
    selectedSize?: string;
    onColorChange: (color: string | undefined) => void;
    onSizeChange: (size: string) => void;
}

export function ProductInfo({
    product,
    selectedColor,
    selectedSize,
    onColorChange,
    onSizeChange
}: ProductInfoProps) {
    // Helper to check stock
    const isVariantInStock = (v: any) => {
        if (v.inStock !== undefined) return v.inStock;
        return (v.inventoryCount || v.inventory || 0) > 0;
    };

    const [quantity, setQuantity] = useState(1);
    const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
    const [notifyEmail, setNotifyEmail] = useState('');
    const addItem = useCartStore((state) => state.addItem);
    const setCartDrawerOpen = useUIStore((state) => state.setCartDrawerOpen);
    const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
    // Find the specific variant based on selection
    const selectedVariant = product.variants.find(v =>
        v.size === selectedSize &&
        (!selectedColor || v.color === selectedColor)
    );

    const isWishlisted = isInWishlist(product.id, selectedVariant?.id);

    const currentPrice = product.salePrice || product.sale_price || product.price || product.base_price || 0;
    const originalPrice = product.price || product.base_price || 0;
    const hasSale = (product.salePrice || product.sale_price) > 0;

    // Get unique colors
    const uniqueColors = Array.from(new Set(product.variants
        .filter(v => v.color)
        .map(v => JSON.stringify({ name: v.color, hex: v.colorHex }))
    )).map(s => JSON.parse(s));

    // Get available sizes for selected color
    const availableSizes = product.variants
        .filter(v => !selectedColor || v.color === selectedColor)
        .map(v => v.size);

    // Get unique sizes to display (all sizes that exist for this product)
    const allSizes = Array.from(new Set(product.variants.map(v => v.size)));

    const handleAddToCart = () => {
        if (!selectedVariant) return;

        // Get image URL (1. Variant image, 2. Color-group image, 3. Product main image)
        let imageUrl = product.images[0];
        if (selectedVariant.images && selectedVariant.images.length > 0) {
            imageUrl = selectedVariant.images[0].url;
        } else if (selectedColor) {
            // Inheritance: Look for images in other variants of the same color
            const sameColorVariantWithImages = product.variants.find(
                v => v.color === selectedColor && v.images && v.images.length > 0
            );
            if (sameColorVariantWithImages?.images?.[0]) {
                imageUrl = sameColorVariantWithImages.images[0].url;
            }
        }

        if (typeof imageUrl !== 'string' && imageUrl?.url) {
            imageUrl = imageUrl.url;
        }

        addItem({
            id: `${product.id}-${selectedVariant.id}`,
            productId: product.id,
            productSlug: product.slug,
            name: product.name,
            image: imageUrl || '/placeholder.jpg',
            price: currentPrice,
            quantity,
            size: selectedSize,
            variant: selectedVariant,
        });

        toast.success('Added to cart');
        setCartDrawerOpen(true);
    };

    const toggleWishlist = () => {
        if (isWishlisted) {
            removeFromWishlist(product.id, selectedVariant?.id);
            toast.success('Removed from wishlist');
        } else {
            addToWishlist(product.id, selectedVariant?.id);
            toast.success('Added to wishlist');
        }
    };

    const handleNotifyMe = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('We\'ll notify you when this item is back in stock!');
        setNotifyEmail('');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: `Check out ${product.name} on Elysè`,
                url: window.location.href,
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    return (
        <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0 lg:sticky lg:top-24">
            <h1 className="text-3xl font-serif font-bold tracking-tight text-neutral-900">{product.name}</h1>

            <div className="mt-3">
                <h2 className="sr-only">Product information</h2>
                <p className="text-2xl tracking-tight text-neutral-900">
                    {hasSale ? (
                        <>
                            <span className="text-red-600 mr-2">₹{currentPrice.toLocaleString()}</span>
                            <span className="text-neutral-500 line-through text-lg">₹{originalPrice.toLocaleString()}</span>
                        </>
                    ) : (
                        <span>₹{currentPrice.toLocaleString()}</span>
                    )}
                </p>
            </div>

            <div className="mt-6">
                <h3 className="sr-only">Description</h3>
                <div className="space-y-6 text-base text-neutral-700" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>

            {/* Color Selector */}
            {uniqueColors.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-sm font-medium text-neutral-900">Color: <span className="text-neutral-500 font-normal">{selectedColor}</span></h3>
                    <div className="mt-2 flex items-center space-x-3">
                        {uniqueColors.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => onColorChange(selectedColor === color.name ? undefined : color.name)}
                                className={clsx(
                                    'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none ring-offset-1',
                                    color.name === selectedColor ? 'ring-2 ring-neutral-900' : 'ring-1 ring-transparent hover:ring-neutral-300'
                                )}
                                aria-label={color.name}
                            >
                                <span
                                    aria-hidden="true"
                                    className="h-8 w-8 rounded-full border border-black border-opacity-10"
                                    style={{ backgroundColor: color.hex || '#ccc' }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-6">
                {/* Size Selector */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-neutral-900">Size</h3>
                    <button
                        onClick={() => setSizeGuideOpen(true)}
                        className="text-sm font-medium text-neutral-600 hover:text-neutral-500 underline"
                    >
                        Size guide
                    </button>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4">
                    {allSizes.map((size) => {
                        // Check if this size is available for the selected color
                        const isAvailableForColor = availableSizes.includes(size);
                        // Find variant for this size + selected color
                        const variant = product.variants.find(v => v.size === size && (!selectedColor || v.color === selectedColor));
                        const inStock = variant ? isVariantInStock(variant) : false;

                        return (
                            <button
                                key={size}
                                onClick={() => isAvailableForColor && onSizeChange(size)}
                                disabled={!isAvailableForColor || !inStock}
                                className={clsx(
                                    'group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-neutral-50 focus:outline-none sm:flex-1 sm:py-6',
                                    size === selectedSize
                                        ? 'border-neutral-900 ring-2 ring-neutral-900 ring-offset-2'
                                        : 'border-neutral-200 text-neutral-900 shadow-sm',
                                    (!isAvailableForColor || !inStock) && 'cursor-not-allowed opacity-25 bg-neutral-50'
                                )}
                            >
                                <span>{size}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedVariant && !isVariantInStock(selectedVariant) ? (
                <div className="mt-6">
                    <p className="text-sm text-neutral-700 mb-2">This size is currently out of stock. Get notified when it's back!</p>
                    <form onSubmit={handleNotifyMe} className="flex gap-2">
                        <input
                            type="email"
                            value={notifyEmail}
                            onChange={(e) => setNotifyEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="flex-1 border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                        <Button type="submit" size="sm">Notify Me</Button>
                    </form>
                </div>
            ) : (
                <>
                    <div className="mt-6 flex items-center gap-4">
                        <div className="flex items-center border border-neutral-300">
                            <button
                                className="p-3 hover:bg-neutral-100"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 text-center w-12">{quantity}</span>
                            <button
                                className="p-3 hover:bg-neutral-100"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <PlusIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1">
                            <Button
                                fullWidth
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={!selectedVariant || !isVariantInStock(selectedVariant)}
                            >
                                {selectedVariant && isVariantInStock(selectedVariant) ? 'Add to cart' : 'Select Size'}
                            </Button>
                        </div>

                        <button
                            onClick={toggleWishlist}
                            className={clsx(
                                "flex items-center justify-center rounded-md p-3 transition-colors duration-200 border",
                                isWishlisted
                                    ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                                    : "bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                            )}
                            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            {isWishlisted ? (
                                <HeartSolidIcon className="h-6 w-6" />
                            ) : (
                                <HeartIcon className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </>
            )}

            {/* Share Button */}
            <div className="mt-4">
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
                >
                    <ShareIcon className="h-4 w-4" />
                    Share this product
                </button>
            </div>

            {/* Accordions */}
            <div className="mt-10 border-t border-neutral-200 pt-10">
                <Accordion.Root type="multiple" className="w-full">
                    <Accordion.Item value="details" className="border-b border-neutral-200">
                        <Accordion.Trigger className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180">
                            Product Details
                            <ChevronDownIcon className="h-5 w-5 transition-transform duration-200" />
                        </Accordion.Trigger>
                        <Accordion.Content className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden text-sm transition-all">
                            <div className="pb-4 pt-2 text-neutral-700">
                                <p>Fabric: {product.fabric}</p>
                                <p>Color: {product.color}</p>
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item value="shipping" className="border-b border-neutral-200">
                        <Accordion.Trigger className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180">
                            Shipping & Returns
                            <ChevronDownIcon className="h-5 w-5 transition-transform duration-200" />
                        </Accordion.Trigger>
                        <Accordion.Content className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden text-sm transition-all">
                            <div className="pb-4 pt-2 text-neutral-700">
                                {product.shippingInfo || 'Free shipping on orders above ₹5,000. Returns accepted within 7 days.'}
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion.Root>
            </div>

            <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
        </div>
    );
}
