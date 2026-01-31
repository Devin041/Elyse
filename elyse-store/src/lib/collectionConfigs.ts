import type { Product } from '@/types';

/**
 * Collection configuration for dynamic collection pages
 * Each collection has metadata and filter logic
 */

export interface CollectionConfig {
    title: string;
    description: string;
    heroImage: string;
    filter: (product: Product) => boolean;
    sortDefault?: string;
}

export const collectionConfigs: Record<string, CollectionConfig> = {
    // All Products
    'all': {
        title: 'All Products',
        description: 'Browse our complete collection of elegant ethnic wear',
        heroImage: 'https://images.unsplash.com/photo-1610189012906-4783fdae2c26?q=80&w=2000&auto=format&fit=crop',
        filter: () => true, // Show all products
    },

    // Best Sellers
    'bestsellers': {
        title: 'Best Sellers',
        description: 'Our most loved and curated pieces for your special moments',
        heroImage: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=2000&auto=format&fit=crop',
        filter: (product) => product.featured === true,
        sortDefault: 'popular',
    },

    // Favorites
    'favorites': {
        title: 'Shop Favorites',
        description: 'Pieces that define elegance—handpicked for you',
        heroImage: 'https://images.unsplash.com/photo-1610652492079-8f5b90e29a94?q=80&w=2000&auto=format&fit=crop',
        filter: (product) => product.featured === true,
    },

    // New Arrivals (already exists, but included for consistency)
    'new-in': {
        title: 'New In',
        description: 'Fresh styles, timeless elegance—discover our newest arrivals now!',
        heroImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2000&auto=format&fit=crop',
        filter: (product) => product.newArrival === true,
        sortDefault: 'date-new',
    },

    // Categories
    'sarees': {
        title: 'Sarees',
        description: 'Elegant drapes for every occasion',
        heroImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=2000&auto=format&fit=crop',
        filter: (product) => product.category === 'Saree',
    },

    'lehenga': {
        title: 'Lehengas',
        description: 'Exquisite bridal and festive lehengas',
        heroImage: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2000&auto=format&fit=crop',
        filter: (product) => product.category === 'Lehenga',
    },

    'anarkali': {
        title: 'Anarkali Suits',
        description: 'Graceful anarkali sets for festive celebrations',
        heroImage: 'https://images.unsplash.com/photo-1585988076790-442271884d4b?q=80&w=2000&auto=format&fit=crop',
        filter: (product) => product.category === 'Anarkali',
    },

    'cape-set': {
        title: 'Cape Sets',
        description: 'Contemporary cape sets with modern elegance',
        heroImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2000&auto=format&fit=crop',
        filter: (product) => product.category === 'Cape Set',
    },

    'sharara-set': {
        title: 'Sharara Sets',
        description: 'Flowing sharara ensembles for special occasions',
        heroImage: 'https://images.unsplash.com/photo-1610189012908-3269f2b7b2d0?q=80&w=2000&auto=format&fit=crop',
        filter: (product) => product.category === 'Sharara Set',
    },

    'kurti-set': {
        title: 'Kurti Sets',
        description: 'Comfortable and stylish everyday ethnic wear',
        heroImage: 'https://images.unsplash.com/photo-1583391733958-e02376e9ced3?q=80&w=2000&auto=format&fit=crop',
        filter: (product) => product.category === 'Kurti Set',
    },

    // Occasions
    'wedding': {
        title: 'Wedding Collection',
        description: 'Bridal and wedding guest ensembles',
        heroImage: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2000&auto=format&fit=crop',
        filter: (product) => product.tags.includes('wedding'),
    },

    'festive': {
        title: 'Festive Collection',
        description: 'Celebrate in style with our festive collection',
        heroImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2000&auto=format&fit=crop',
        filter: (product) => product.tags.includes('festive'),
    },

    // Sale
    'sale': {
        title: 'Sale',
        description: 'Exclusive discounts on selected styles',
        heroImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2000&auto=format&fit=crop',
        filter: (product) => product.salePrice !== undefined && product.salePrice < product.price,
        sortDefault: 'price-low',
    },
};

/**
 * Get collection config by slug
 */
export const getCollectionConfig = (slug: string): CollectionConfig | null => {
    return collectionConfigs[slug] || null;
};

/**
 * Get all available collection slugs
 */
export const getCollectionSlugs = (): string[] => {
    return Object.keys(collectionConfigs);
};
