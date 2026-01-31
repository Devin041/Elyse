'use client';

import { useState, useMemo, useEffect } from 'react';
import { CollectionHero } from '@/components/collection/CollectionHero';
import { FilterBar } from '@/components/collection/FilterBar';
import { ProductCard } from '@/components/product/ProductCard';
import { Pagination } from '@/components/ui/Pagination';
import { NewsletterSection } from '@/components/sections/NewsletterSection';
import { products } from '@/lib/data';
import type { Product } from '@/types';

const ITEMS_PER_PAGE = 12;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function NewInPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('newest');
    const [gridColumns, setGridColumns] = useState(4);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
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
                    isNewArrival: 'true',
                    page: currentPage.toString(),
                    limit: ITEMS_PER_PAGE.toString(),
                    sortBy: backendSort
                });

                const res = await fetch(`${API_URL}/products?${queryParams}`);
                const data = await res.json();

                if (data.success) {
                    setProducts(data.data);
                    setTotalProducts(data.pagination.total);
                } else {
                    setProducts([]);
                    setTotalProducts(0);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage, sortBy]);

    // Pagination
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

    // Reset to page 1 when sort changes
    const handleSortChange = (newSort: string) => {
        setSortBy(newSort);
        setCurrentPage(1);
    };

    // Grid column class
    const gridClass = `grid grid-cols-1 sm:grid-cols-2 ${gridColumns === 2 ? 'lg:grid-cols-2' :
        gridColumns === 3 ? 'lg:grid-cols-3' :
            'lg:grid-cols-4'
        } gap-8`;

    return (
        <div className="min-h-screen">
            {/* Hero Banner */}
            <CollectionHero
                title="New In"
                description="Fresh styles, timeless elegance—discover our newest arrivals now!"
                image="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2000&auto=format&fit=crop"
            />

            {/* Main Content */}
            <div className="container-premium">
                {/* Filter Bar */}
                <FilterBar
                    onSortChange={handleSortChange}
                    onViewChange={setGridColumns}
                    currentView={gridColumns}
                />

                {/* Product Count */}
                <div className="py-4">
                    <p className="text-neutral-600">
                        Showing {products.length} of {totalProducts} products
                    </p>
                </div>

                {/* Product Grid */}
                <section className="py-12">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900"></div>
                        </div>
                    ) : (
                        <>
                            <div className={gridClass}>
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* No products message */}
                            {products.length === 0 && (
                                <div className="text-center py-20">
                                    <p className="text-neutral-500 text-lg">No new arrivals found.</p>
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* Newsletter Section */}
            <NewsletterSection />
        </div>
    );
}
