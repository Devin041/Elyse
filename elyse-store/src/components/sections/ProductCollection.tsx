import Link from 'next/link';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types';

interface ProductCollectionProps {
    title: string;
    description?: string;
    products: Product[];
    viewAllLink?: string;
    backgroundColor?: string;
}

export function ProductCollection({
    title,
    description,
    products,
    viewAllLink,
    backgroundColor = 'bg-white'
}: ProductCollectionProps) {
    return (
        <section className={`py-16 ${backgroundColor}`}>
            <div className="container-custom">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-4">{title}</h2>
                    {description && <p className="text-neutral-600">{description}</p>}
                </div>

                <ProductGrid products={products} />

                {viewAllLink && (
                    <div className="mt-12 text-center">
                        <Link href={viewAllLink}>
                            <Button variant="outline" size="lg">View All</Button>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
