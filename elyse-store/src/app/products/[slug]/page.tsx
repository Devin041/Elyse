import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ProductContainer } from '@/components/product/ProductContainer';
import { RelatedProducts, RelatedProductsSkeleton } from '@/components/product/RelatedProducts';


interface ProductPageProps {
    params: Promise<{
        slug: string;
    }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getProduct(slug: string) {
    try {
        const res = await fetch(`${API_URL}/products/${slug}`, {
            next: { revalidate: 3600 } // Cache for 1 hour for better speed
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Failed to fetch product:', error);
        return null;
    }
}

export async function generateMetadata({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: 'Product Not Found | Elysè',
        };
    }

    return {
        title: `${product.name} | Elysè`,
        description: product.description?.substring(0, 160) || `Buy ${product.name} at Elysè`,
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    return (
        <div className="bg-white">
            <div className="container-custom py-16 sm:py-24">
                <div className="lg:grid lg:grid-cols-1 lg:gap-x-8">
                    <ProductContainer product={product} />
                </div>

                {/* Related Products - Loaded independently to break waterfall */}
                <div className="mt-24 border-t border-neutral-200 pt-8">
                    <Suspense fallback={<RelatedProductsSkeleton />}>
                        <RelatedProducts
                            categorySlug={product.category_slug}
                            excludeId={product.id}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
