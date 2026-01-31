import { ProductCollection } from '@/components/sections/ProductCollection';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getRelatedProducts(categorySlug?: string, excludeId?: string) {
    try {
        const url = categorySlug
            ? `${API_URL}/products?categorySlug=${categorySlug}&limit=5`
            : `${API_URL}/products?limit=5`;

        const res = await fetch(url, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        const data = await res.json();
        const products = data.success ? data.data : [];
        return products.filter((p: any) => p.id !== excludeId).slice(0, 4);
    } catch (error) {
        console.error('Failed to fetch related products:', error);
        return [];
    }
}

interface RelatedProductsProps {
    categorySlug?: string;
    excludeId: string;
}

export async function RelatedProducts({ categorySlug, excludeId }: RelatedProductsProps) {
    const products = await getRelatedProducts(categorySlug, excludeId);

    if (products.length === 0) return null;

    return (
        <ProductCollection
            title="You may also like"
            products={products}
        />
    );
}

export function RelatedProductsSkeleton() {
    return (
        <section className="py-16 bg-white">
            <div className="container-custom">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <div className="h-10 w-64 bg-neutral-100 animate-pulse mx-auto rounded mb-4" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-4">
                            <div className="aspect-[3/4] bg-neutral-100 animate-pulse rounded-md" />
                            <div className="h-4 w-3/4 bg-neutral-100 animate-pulse rounded" />
                            <div className="h-4 w-1/4 bg-neutral-100 animate-pulse rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
