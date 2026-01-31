
import { CollectionHero } from '@/components/collection/CollectionHero';
import { NewsletterSection } from '@/components/sections/NewsletterSection';
import { getCollectionConfig } from '@/lib/collectionConfigs';
import { CollectionContent } from '@/components/collection/CollectionContent';

const ITEMS_PER_PAGE = 12;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getData(slug: string, searchParams: any) {
    const page = Number(searchParams.page) || 1;
    const sortBy = searchParams.sortBy || 'newest';

    // Map frontend sort keys to backend sort keys
    let backendSort = 'newest';
    switch (sortBy) {
        case 'date-new': backendSort = 'newest'; break;
        case 'date-old': backendSort = 'oldest'; break;
        case 'price-low': backendSort = 'price_asc'; break;
        case 'price-high': backendSort = 'price_desc'; break;
        case 'name-az': backendSort = 'name_asc'; break;
        case 'name-za': backendSort = 'name_desc'; break;
        default: backendSort = 'newest';
    }

    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        sortBy: backendSort,
        includeInactive: 'false'
    });

    if (searchParams.minPrice) queryParams.append('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) queryParams.append('maxPrice', searchParams.maxPrice);
    if (searchParams.color) queryParams.append('color', searchParams.color);
    if (searchParams.size) queryParams.append('size', searchParams.size);

    let bannerData = {
        title: slug.replace(/-/g, ' '),
        description: '',
        imageUrl: ''
    };

    // Normalize slug for fetching (handle legacy URLs)
    const normalizedSlug = slug === 'bestsellers' ? 'best-sellers' :
        slug === 'new-in' ? 'new-arrivals' : slug;

    try {
        const res = await fetch(`${API_URL}/collections/slug/${normalizedSlug}`, { next: { revalidate: 60 } });
        if (res.ok) {
            const data = await res.json();
            if (data.data) {
                bannerData = {
                    title: data.data.name,
                    description: data.data.description,
                    imageUrl: data.data.image_url
                };
            }
        }
    } catch (e) { }

    if (!bannerData.imageUrl) {
        try {
            const res = await fetch(`${API_URL}/categories/slug/${normalizedSlug}`, { next: { revalidate: 60 } });
            if (res.ok) {
                const data = await res.json();
                if (data.data) {
                    bannerData = {
                        title: data.data.name,
                        description: data.data.description,
                        imageUrl: data.data.poster_url || data.data.image_url
                    };
                }
            }
        } catch (e) { }
    }

    if (!bannerData.imageUrl) {
        const config = getCollectionConfig(slug); // Keep original slug for config fallback
        if (config) {
            bannerData = {
                title: config.title,
                description: config.description,
                imageUrl: config.heroImage
            };
        }
    }

    if (slug === 'all') {
    } else if (slug === 'bestsellers' || slug === 'best-sellers') {
        queryParams.append('isFeatured', 'true');
    } else if (slug === 'new-in' || slug === 'new-arrivals') {
        queryParams.append('isNewArrival', 'true');
    } else if (slug === 'sale') {
        queryParams.append('sortBy', 'price_asc');
    } else {
        queryParams.append('categorySlug', slug);
    }

    if (['wedding', 'festive', 'mehendi', 'cocktails', 'sangeet'].includes(slug)) {
        queryParams.delete('categorySlug');
        queryParams.append('tag', slug);
    }

    try {
        const res = await fetch(`${API_URL}/products?${queryParams.toString()}`, { cache: 'no-store' });
        const data = await res.json();
        return {
            products: data.success ? data.data : [],
            pagination: data.success ? data.pagination : { total: 0, pages: 0 },
            banner: bannerData
        };
    } catch (error) {
        console.error('Product fetch failed:', error);
        return {
            products: [],
            pagination: { total: 0, pages: 0 },
            banner: bannerData
        };
    }
}

export default async function CollectionPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;

    const { products, pagination, banner } = await getData(slug, resolvedSearchParams);
    const currentSort = typeof resolvedSearchParams.sortBy === 'string' ? resolvedSearchParams.sortBy : 'newest';

    return (
        <div className="min-h-screen">
            <CollectionHero
                title={banner.title}
                description={banner.description || ''}
                image={banner.imageUrl || '/images/collections/default.jpg'}
            />

            <div className="container-premium">
                <CollectionContent
                    products={products}
                    pagination={{ ...pagination, page: Number(resolvedSearchParams.page) || 1 }}
                    currentSort={currentSort}
                    slug={slug}
                />
            </div>

            <NewsletterSection />
        </div>
    );
}
