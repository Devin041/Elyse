'use client';

import { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';
import { trendingSearches } from '@/lib/data';
import type { Product } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export function SearchModal() {
    const { searchModalOpen, setSearchModalOpen } = useUIStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search function
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        try {
            // Call backend API
            const response = await fetch(`${API_URL}/products?search=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data.success) {
                setResults(data.data);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounce search with 300ms delay
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, performSearch]);

    const handleTrendingClick = (term: string) => {
        setQuery(term);
    };

    const handleClose = () => {
        setSearchModalOpen(false);
        // Reset state after animation completes
        setTimeout(() => {
            setQuery('');
            setResults([]);
        }, 300);
    };

    return (
        <Transition.Root show={searchModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-0 flex">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="pointer-events-auto w-full">
                                    <div className="flex h-full flex-col bg-white">
                                        {/* Search Header */}
                                        <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-4 sm:px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-1 items-center gap-3 rounded-lg border border-neutral-300 px-4 py-3 focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900">
                                                    <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                                                    <input
                                                        type="text"
                                                        className="flex-1 border-0 bg-transparent text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-0"
                                                        placeholder="Search products..."
                                                        value={query}
                                                        onChange={(e) => setQuery(e.target.value)}
                                                        autoFocus
                                                    />
                                                    {query && (
                                                        <button
                                                            onClick={() => setQuery('')}
                                                            className="text-neutral-400 hover:text-neutral-600"
                                                        >
                                                            <XMarkIcon className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
                                                    onClick={handleClose}
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>

                                        {/* Search Results / Trending Searches */}
                                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
                                            {!query ? (
                                                /* Trending Searches */
                                                <div className="max-w-4xl mx-auto">
                                                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">
                                                        Trending Searches
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {trendingSearches.map((term) => (
                                                            <button
                                                                key={term}
                                                                onClick={() => handleTrendingClick(term)}
                                                                className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
                                                            >
                                                                {term}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : isSearching ? (
                                                /* Loading State */
                                                <div className="text-center py-12">
                                                    <p className="text-neutral-500">Searching...</p>
                                                </div>
                                            ) : results.length > 0 ? (
                                                /* Search Results */
                                                <div className="max-w-6xl mx-auto">
                                                    <p className="text-sm text-neutral-500 mb-6">
                                                        {results.length} {results.length === 1 ? 'result' : 'results'} found
                                                    </p>
                                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                        {results.map((product) => (
                                                            <Link
                                                                key={product.id}
                                                                href={`/products/${product.slug}`}
                                                                onClick={handleClose}
                                                                className="group"
                                                            >
                                                                <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-200 relative rounded-lg">
                                                                    {product.images?.[0]?.url ? (
                                                                        <Image
                                                                            src={product.images[0].url}
                                                                            alt={product.name}
                                                                            fill
                                                                            unoptimized
                                                                            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                                                            onError={(e) => {
                                                                                console.error('Image failed to load:', product.images[0].url);
                                                                                e.currentTarget.src = '/placeholder.jpg';
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                                            No Image
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="mt-4">
                                                                    <h3 className="text-sm font-medium text-neutral-900 group-hover:text-neutral-600">
                                                                        {product.name}
                                                                    </h3>
                                                                    <p className="mt-1 text-sm text-neutral-500">
                                                                        {product.category_name || product.category || 'Uncategorized'}
                                                                    </p>
                                                                    <p className="mt-1 text-sm font-medium text-neutral-900">
                                                                        ₹{(product.sale_price || product.base_price || product.price || 0).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* No Results */
                                                <div className="max-w-4xl mx-auto text-center py-12">
                                                    <p className="text-neutral-500 mb-6">
                                                        No products found for "{query}"
                                                    </p>
                                                    <div>
                                                        <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">
                                                            Try searching for
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 justify-center">
                                                            {trendingSearches.slice(0, 4).map((term) => (
                                                                <button
                                                                    key={term}
                                                                    onClick={() => handleTrendingClick(term)}
                                                                    className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
                                                                >
                                                                    {term}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
