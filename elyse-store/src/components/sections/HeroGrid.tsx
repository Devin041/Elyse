"use client";

import Link from 'next/link';

interface HeroGridItem {
    id: string;
    title: string;
    image: string;
    link: string;
    textAlign?: 'start' | 'center' | 'end';
}

interface HeroGridProps {
    config?: {
        sectionTitle?: string;
        description?: string;
        pattern?: 'equal' | 'featured' | 'alternating';
        overlayDarkness?: number;
        ctaText?: string;
        items: HeroGridItem[];
    };
    items?: HeroGridItem[]; // Legacy support
}

export function HeroGrid({ config, items }: HeroGridProps) {
    // Handle both new config format and legacy items array
    const gridConfig = config || {
        sectionTitle: '',
        description: '',
        pattern: 'equal' as const,
        overlayDarkness: 60,
        ctaText: 'EXPLORE',
        items: items || []
    };

    const { sectionTitle, description, pattern, overlayDarkness, ctaText, items: gridItems } = gridConfig;

    if (!gridItems || gridItems.length === 0) return null;

    // Determine grid classes based on pattern and item count
    const getGridClasses = () => {
        const count = gridItems.length;

        if (pattern === 'featured' && count >= 4) {
            // 1 large (spans 2 cols) + 3 small
            return 'grid grid-cols-1 md:grid-cols-4 gap-6';
        }

        if (pattern === 'alternating') {
            return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';
        }

        // Equal pattern or fallback
        if (count === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-6';
        if (count === 3) return 'grid grid-cols-1 md:grid-cols-3 gap-6';
        if (count >= 4) return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';

        return 'grid grid-cols-1 gap-6';
    };

    const getItemClasses = (index: number) => {
        const count = gridItems.length;

        if (pattern === 'featured' && count >= 4 && index === 0) {
            // First item spans 2 columns on desktop
            return 'md:col-span-2 md:row-span-2';
        }

        if (pattern === 'alternating') {
            // Alternate between regular and slightly larger
            return index % 2 === 0 ? 'md:col-span-1' : 'md:col-span-1';
        }

        return '';
    };

    const getTextAlignClass = (align?: 'start' | 'center' | 'end') => {
        if (align === 'center') return 'items-center text-center';
        if (align === 'end') return 'items-end text-right';
        return 'items-start text-left';
    };

    return (
        <section className="container-premium section-spacing">
            {/* Section Header */}
            {(sectionTitle || description) && (
                <div className="text-center mb-12">
                    {sectionTitle && (
                        <h2 className="text-3xl font-semibold mb-4 tracking-wide uppercase">
                            {sectionTitle}
                        </h2>
                    )}
                    {description && (
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            {description}
                        </p>
                    )}
                </div>
            )}

            {/* Grid Items */}
            <div className={getGridClasses()}>
                {gridItems.map((item, index) => (
                    <Link
                        key={item.id}
                        href={item.link}
                        className={`group relative block aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 ${getItemClasses(index)}`}
                    >
                        {item.image ? (
                            <img
                                src={item.image}
                                alt={item.title}
                                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-400">
                                <span>No Image</span>
                            </div>
                        )}

                        {/* Overlay with Text */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-t from-black via-black/0 to-transparent flex flex-col justify-end p-6 ${getTextAlignClass(item.textAlign)}`}
                            style={{
                                background: `linear-gradient(to top, rgba(0,0,0,${overlayDarkness / 100}) 0%, rgba(0,0,0,0) 50%, transparent 100%)`
                            }}
                        >
                            <h3 className="text-xl font-bold text-white tracking-widest uppercase mb-2">
                                {item.title}
                            </h3>
                            <span className="text-sm font-medium text-white/90 underline decoration-white/50 underline-offset-4 group-hover:text-white group-hover:decoration-white transition-all">
                                {ctaText}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
