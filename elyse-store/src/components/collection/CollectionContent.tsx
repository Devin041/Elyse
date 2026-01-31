"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FilterBar } from "./FilterBar";
import { FilterSidebar } from "./FilterSidebar";
import { ProductCard } from "../product/ProductCard";
import { Pagination } from "../ui/Pagination";

interface CollectionContentProps {
    products: any[];
    pagination: {
        total: number;
        pages: number;
        page: number;
    };
    currentSort: string;
    slug: string;
}

export function CollectionContent({ products, pagination, currentSort, slug }: CollectionContentProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [view, setView] = useState(4);
    const [showFilters, setShowFilters] = useState(true);
    const [sidebarData, setSidebarData] = useState({ categories: [], collections: [] });

    useEffect(() => {
        const fetchSidebarData = async () => {
            try {
                const [catsRes, colsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/categories`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/collections`)
                ]);
                const cats = await catsRes.json();
                const cols = await colsRes.json();
                setSidebarData({
                    categories: cats.data || [],
                    collections: cols.data || []
                });
            } catch (e) {
                console.error("Failed to fetch sidebar data", e);
            }
        };
        fetchSidebarData();
    }, []);

    const handleSortChange = (newSort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sortBy", newSort);
        params.set("page", "1"); // Reset to page 1 on sort
        router.push(`${pathname}?${params.toString()}`);
    };

    // Construct Grid Class based on view
    const gridClass = `grid grid-cols-1 sm:grid-cols-2 ${view === 2 ? "lg:grid-cols-2" :
        view === 3 ? "lg:grid-cols-3" :
            "lg:grid-cols-4"
        } gap-8`;

    return (
        <>
            <FilterBar
                currentSort={currentSort}
                productCount={pagination.total}
                currentView={view}
                onViewChange={setView}
                onSortChange={handleSortChange}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
            />

            <div className="flex flex-col lg:flex-row gap-8 py-8">
                {showFilters && (
                    <div className="w-full lg:w-[280px] lg:sticky lg:top-24 lg:h-fit">
                        <FilterSidebar
                            categories={sidebarData.categories}
                            collections={sidebarData.collections}
                        />
                    </div>
                )}

                <section className="flex-1">
                    {products.length > 0 ? (
                        <div className={gridClass}>
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-neutral-500 text-lg">No products found for the selected filters.</p>
                            <button
                                onClick={() => router.push(pathname)}
                                className="mt-4 text-sm underline underline-offset-4"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}

                    {pagination.pages > 1 && (
                        <div className="mt-12">
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.pages}
                                baseUrl={`/collections/${slug}`}
                                searchParams={Object.fromEntries(searchParams.entries())}
                            />
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
