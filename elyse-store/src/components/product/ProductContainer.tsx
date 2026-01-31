'use client';

import { useState, useEffect } from 'react';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import type { Product } from '@/types';

interface ProductContainerProps {
    product: Product;
}

export function ProductContainer({ product }: ProductContainerProps) {
    // Get unique colors from variants
    const colors = Array.from(new Set(product.variants
        .filter(v => v.color)
        .map(v => JSON.stringify({ name: v.color, hex: v.colorHex }))
    )).map(s => JSON.parse(s));

    // Initial state - Start with nothing selected to show primary images
    const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

    // Find variants for selected color
    const variantsForColor = selectedColor
        ? product.variants.filter(v => v.color === selectedColor)
        : product.variants;

    // Initial size - Start with nothing selected
    const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);

    // Update size when color changes if current size not available
    useEffect(() => {
        if (selectedColor) {
            const availableSizes = product.variants
                .filter(v => v.color === selectedColor)
                .map(v => v.size);

            if (selectedSize && !availableSizes.includes(selectedSize)) {
                setSelectedSize(undefined);
            }
        }
    }, [selectedColor, product.variants, selectedSize]);

    // Determine images to show
    let displayImages = product.images;
    if (selectedColor) {
        // Find a variant with this color that has images
        const variantWithImages = product.variants.find(
            v => v.color === selectedColor && v.images && v.images.length > 0
        );

        // ONLY override if the variant actually has specific images assigned
        if (variantWithImages && variantWithImages.images && variantWithImages.images.length > 0) {
            displayImages = variantWithImages.images;
        }
    }

    return (
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
            {/* Image Gallery */}
            <ProductImageGallery
                images={displayImages}
                name={product.name}
            />

            {/* Product Info */}
            <ProductInfo
                product={product}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                onColorChange={setSelectedColor}
                onSizeChange={setSelectedSize}
            />
        </div>
    );
}
