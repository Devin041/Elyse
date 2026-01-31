'use client';

import { useState } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { optimizeCloudinaryUrl } from '@/lib/utils/image';

interface ProductImageGalleryProps {
    images: (string | { url: string })[];
    name: string;
}

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

    // Helper to get URL with optimization
    const getImageUrl = (img: string | { url: string }, index: number, width?: number) => {
        if (imageErrors[index]) return PLACEHOLDER_IMAGE;
        if (!img) return PLACEHOLDER_IMAGE;
        const url = typeof img === 'string' ? img : img.url;
        return optimizeCloudinaryUrl(url, width);
    };

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] no-scrollbar">
                {images?.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={clsx(
                            'relative aspect-[3/4] w-20 flex-shrink-0 overflow-hidden border transition-all',
                            selectedImage === index ? 'border-neutral-900 ring-1 ring-neutral-900' : 'border-transparent hover:border-neutral-300'
                        )}
                    >
                        <Image
                            src={getImageUrl(image, index, 200)}
                            alt={`${name} view ${index + 1}`}
                            fill
                            className="object-cover object-center"
                            sizes="80px"
                            onError={() => setImageErrors(prev => ({ ...prev, [index]: true }))}
                        />
                    </button>
                ))}
            </div>

            {/* Main Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                <Image
                    src={getImageUrl(images?.[selectedImage], selectedImage, 1200)}
                    alt={name}
                    fill
                    className="object-cover object-center"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={() => setImageErrors(prev => ({ ...prev, [selectedImage]: true }))}
                />
            </div>
        </div>
    );
}
