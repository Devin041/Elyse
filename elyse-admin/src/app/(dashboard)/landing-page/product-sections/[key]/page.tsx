"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Search } from "lucide-react";
import Link from "next/link";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSectionSchema } from '@/lib/validations/landingPage';
import { toast } from 'react-hot-toast';
import type { z } from 'zod';

type ProductSectionFormData = z.infer<typeof productSectionSchema>;

interface Product {
    id: string;
    name: string;
    primary_image: string;
    price: number;
    is_featured?: boolean;
    created_at?: string;
}

export default function ProductSectionEditPage({ params }: { params: { key: string } }) {
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
        reset,
    } = useForm<ProductSectionFormData>({
        resolver: zodResolver(productSectionSchema),
        defaultValues: {
            sectionKey: params.key,
            title: "",
            selectionType: "auto",
            autoFilter: {
                isFeatured: true,
                isNewArrival: false,
                limit: 8
            },
            manualProductIds: [],
            productsCount: 8,
            columnsDesktop: 4,
            columnsTablet: 2,
            columnsMobile: 1,
            isEnabled: true
        },
    });

    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch section data and products in parallel
                const [sectionRes, productsRes] = await Promise.all([
                    fetch(`/api/landing-page/product-sections/${params.key}`),
                    fetch('/api/products')
                ]);

                if (!sectionRes.ok) throw new Error('Failed to fetch section');
                const sectionData = await sectionRes.json();

                if (productsRes.ok) {
                    const productsData = await productsRes.json();
                    setProducts(productsData);
                }

                // Map API data to form
                reset({
                    sectionKey: params.key,
                    title: sectionData.title,
                    selectionType: sectionData.selection_type || "auto",
                    autoFilter: sectionData.auto_filter || {
                        isFeatured: true,
                        isNewArrival: false,
                        limit: 8
                    },
                    manualProductIds: sectionData.manual_product_ids || [],
                    isEnabled: sectionData.is_enabled,
                    // Config fields
                    productsCount: sectionData.config?.productsCount || 8,
                    columnsDesktop: sectionData.config?.columnsDesktop || 4,
                    columnsTablet: sectionData.config?.columnsTablet || 2,
                    columnsMobile: sectionData.config?.columnsMobile || 1,
                });

            } catch (error) {
                console.error(error);
                toast.error("Failed to load data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [params.key, reset]);

    // Watch values for conditional rendering and preview
    const selectionType = watch("selectionType");
    const manualProductIds = watch("manualProductIds");
    const productsCount = watch("productsCount");
    const title = watch("title");
    const autoFilter = watch("autoFilter");

    const onSubmit = async (data: ProductSectionFormData) => {
        try {
            const payload = {
                title: data.title,
                selection_type: data.selectionType,
                auto_filter: data.autoFilter,
                manual_product_ids: data.manualProductIds,
                is_enabled: data.isEnabled,
                config: {
                    productsCount: data.productsCount,
                    columnsDesktop: data.columnsDesktop,
                    columnsTablet: data.columnsTablet,
                    columnsMobile: data.columnsMobile
                }
            };

            const res = await fetch(`/api/landing-page/product-sections/${params.key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to update section');

            toast.success("Product section saved successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save changes. Please try again.");
        }
    };

    const toggleProductSelection = (productId: string) => {
        const currentIds = manualProductIds || [];
        // Cast to string just in case, though API returns string UUIDs
        const strId = String(productId);
        // @ts-ignore - manualProductIds is typed as number[] in schema but we use strings/UUIDs now. 
        // We might need to update schema or cast here.
        const newIds = currentIds.includes(strId as any)
            ? currentIds.filter(id => id !== (strId as any))
            : [...currentIds, strId];
        setValue("manualProductIds", newIds as any);
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    // Filter products for preview
    const filteredProducts = products.filter(p => {
        if (searchQuery) {
            return p.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const previewProducts = selectionType === "auto"
        ? products
            .filter(p => {
                if (autoFilter?.isFeatured && !p.is_featured) return false;
                // Add new arrival logic if needed (e.g. check created_at)
                return true;
            })
            .slice(0, productsCount)
        : products
            .filter(p => manualProductIds?.includes(p.id as any))
            .slice(0, productsCount);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/landing-page"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {title || 'Product'} Section
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Configure product display and selection
                        </p>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("title")}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., BEST SELLERS"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of Products
                                </label>
                                <select
                                    {...register("productsCount", { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={4}>4 Products</option>
                                    <option value={8}>8 Products</option>
                                    <option value={12}>12 Products</option>
                                    <option value={16}>16 Products</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Product Selection */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Selection</h2>

                        {/* Selection Type */}
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="auto"
                                        {...register("selectionType")}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        Automatic Selection
                                    </span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="manual"
                                        {...register("selectionType")}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        Manual Selection
                                    </span>
                                </label>
                            </div>

                            {/* Auto Selection Settings */}
                            {selectionType === "auto" && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm font-medium text-blue-900 mb-3">
                                        Automatic Selection Rules
                                    </p>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                {...register("autoFilter.isFeatured")}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">
                                                Only Featured Products
                                            </span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                {...register("autoFilter.isNewArrival")}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">
                                                Only New Arrivals
                                            </span>
                                        </label>
                                    </div>
                                    <p className="text-xs text-blue-700 mt-3">
                                        Products will be automatically selected based on these criteria and sorted by newest first.
                                    </p>
                                </div>
                            )}

                            {/* Manual Selection */}
                            {selectionType === "manual" && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-96 overflow-y-auto">
                                        {filteredProducts.map((product) => (
                                            <label
                                                key={product.id}
                                                className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={manualProductIds?.includes(product.id as any)}
                                                    onChange={() => toggleProductSelection(product.id)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <img
                                                    src={product.primary_image || '/placeholder.png'}
                                                    alt={product.name}
                                                    className="ml-3 h-12 w-12 rounded object-cover"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        ₹{product.price.toLocaleString()}
                                                    </p>
                                                </div>
                                                {product.is_featured && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Featured
                                                    </span>
                                                )}
                                            </label>
                                        ))}
                                        {filteredProducts.length === 0 && (
                                            <div className="p-4 text-center text-gray-500">
                                                No products found
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600">
                                        {manualProductIds?.length || 0} of {productsCount} products selected
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Current Selection Preview */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Preview ({selectionType === "auto" ? "Auto" : "Manual"} Selection)
                        </h2>

                        <div className="grid grid-cols-4 gap-4">
                            {previewProducts.map((product) => (
                                <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <img
                                        src={product.primary_image || '/placeholder.png'}
                                        alt={product.name}
                                        className="w-full aspect-square object-cover"
                                    />
                                    <div className="p-2">
                                        <p className="text-xs font-medium text-gray-900 truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            ₹{product.price.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {previewProducts.length === 0 && (
                                <div className="col-span-4 text-center py-8 text-gray-500">
                                    No products selected
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Layout Settings */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Layout</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Desktop Columns
                                </label>
                                <select
                                    {...register("columnsDesktop", { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {[2, 3, 4, 5, 6].map(n => (
                                        <option key={n} value={n}>{n} Columns</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tablet Columns
                                </label>
                                <select
                                    {...register("columnsTablet", { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {[1, 2, 3, 4].map(n => (
                                        <option key={n} value={n}>{n} Columns</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mobile Columns
                                </label>
                                <select
                                    {...register("columnsMobile", { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {[1, 2].map(n => (
                                        <option key={n} value={n}>{n} Column{n > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                {...register("isEnabled")}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                                Enable this section
                            </span>
                        </label>
                        <p className="ml-6 text-xs text-gray-500 mt-1">
                            Disabled sections won't be shown on the landing page
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}
