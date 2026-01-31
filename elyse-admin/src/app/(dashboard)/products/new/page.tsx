"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        basePrice: "",
        salePrice: "",
        categoryId: "",
        sku: "",
        isFeatured: false,
        isActive: true,
        isNewArrival: false,
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data.data || []);
            // Set first category as default if available
            if (data.data && data.data.length > 0) {
                setFormData(prev => ({ ...prev, categoryId: data.data[0].id }));
            }
        } catch (error) {
            toast.error('Failed to fetch categories');
        } finally {
            setLoadingCategories(false);
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData({
            ...formData,
            name,
            slug: generateSlug(name),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.categoryId) {
            toast.error("Please select a category");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                basePrice: Number(formData.basePrice),
                salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
                images: images,
            };

            console.log('Creating product with payload:', {
                name: payload.name,
                imageCount: images.length,
                images: images
            });

            const response = await api.post("/products", payload);

            toast.success("Product created successfully");

            // Redirect to edit page for adding variants
            const createdProduct = response.data.data;
            router.push(`/products/${createdProduct.slug}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <Link
                    href="/products"
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Products
                </Link>
                <h1 className="text-2xl font-semibold text-gray-900 mt-2">
                    Add New Product
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    After creating, you'll be able to add variants and manage images
                </p>
            </div>

            <div className="bg-white shadow sm:rounded-lg p-6 max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                            value={formData.name}
                            onChange={handleNameChange}
                            placeholder="e.g., Classic Cotton Kurta"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Slug (Auto-generated)
                        </label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                            value={formData.slug}
                            readOnly
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Category *
                        </label>
                        {loadingCategories ? (
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                Loading categories...
                            </div>
                        ) : (
                            <select
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                value={formData.categoryId}
                                onChange={(e) =>
                                    setFormData({ ...formData, categoryId: e.target.value })
                                }
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Describe your product..."
                        />
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Base Price (₹) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                value={formData.basePrice}
                                onChange={(e) =>
                                    setFormData({ ...formData, basePrice: e.target.value })
                                }
                                placeholder="2999"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Sale Price (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                value={formData.salePrice}
                                onChange={(e) =>
                                    setFormData({ ...formData, salePrice: e.target.value })
                                }
                                placeholder="2499"
                            />
                            <p className="mt-1 text-xs text-gray-500">Optional - Leave blank for no sale</p>
                        </div>
                    </div>

                    {/* SKU */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            SKU (Stock Keeping Unit)
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="KURTA-001"
                        />
                    </div>

                    {/* Product Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Images
                        </label>
                        <ImageUploader
                            onImagesUploaded={setImages}
                            onBusyChange={setImageUploading}
                            maxImages={5}
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Upload up to 5 images. First image will be the main product image.
                        </p>
                    </div>

                    {/* Status Toggles */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Product Status</h3>
                        <div className="space-y-4">
                            {/* Active Toggle */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="isActive"
                                        type="checkbox"
                                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                        checked={formData.isActive}
                                        onChange={(e) =>
                                            setFormData({ ...formData, isActive: e.target.checked })
                                        }
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="isActive" className="font-medium text-gray-700">
                                        Active
                                    </label>
                                    <p className="text-gray-500">Make this product visible in the store</p>
                                </div>
                            </div>

                            {/* Featured Toggle */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="isFeatured"
                                        type="checkbox"
                                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                        checked={formData.isFeatured}
                                        onChange={(e) =>
                                            setFormData({ ...formData, isFeatured: e.target.checked })
                                        }
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="isFeatured" className="font-medium text-gray-700">
                                        Featured Product
                                    </label>
                                    <p className="text-gray-500">Show in featured section on homepage</p>
                                </div>
                            </div>

                            {/* New Arrival Toggle */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="isNewArrival"
                                        type="checkbox"
                                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                        checked={formData.isNewArrival}
                                        onChange={(e) =>
                                            setFormData({ ...formData, isNewArrival: e.target.checked })
                                        }
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="isNewArrival" className="font-medium text-gray-700">
                                        New Arrival
                                    </label>
                                    <p className="text-gray-500">Show "NEW" badge on product</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <Link
                            href="/products"
                            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading || loadingCategories || imageUploading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                    Creating...
                                </>
                            ) : (
                                "Create Product"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
