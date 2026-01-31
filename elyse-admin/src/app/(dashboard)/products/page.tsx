"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Plus, Edit, Trash2, Loader2, Copy, Archive } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    sale_price?: number;
    category_name: string;
    inventory_count: number;
    is_active: boolean;
    images: { url: string }[];
}

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get("/products?limit=100");
            setProducts(data.data);
        } catch (error) {
            toast.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            await api.delete(`/products/${id}`);
            toast.success("Product deleted");
            fetchProducts();
        } catch (error: any) {
            console.error("Delete failed:", error);
            const message = error?.response?.data?.error || error.message || "Failed to delete product";
            toast.error(message);
        }
    };

    const handleDuplicate = async (id: string) => {
        if (!confirm("Duplicate this product?")) return;

        try {
            const { data } = await api.post(`/products/${id}/duplicate`);
            toast.success("Product duplicated");
            router.push(`/products/${data.data.slug}`);
        } catch (error) {
            toast.error("Failed to duplicate product");
        }
    };

    const handleArchive = async (id: string) => {
        if (!confirm("Are you sure you want to archive this product? It will be hidden from the store.")) return;

        try {
            await api.put(`/products/${id}`, { isActive: false });
            toast.success("Product archived");
            fetchProducts();
        } catch (error) {
            toast.error("Failed to archive product");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
                <Link
                    href="/products/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {product.images?.[0]?.url ? (
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    src={product.images[0].url}
                                                    alt=""
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                                    No Img
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {product.name}
                                            </div>
                                            <div className="text-sm text-gray-500">{product.slug}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {product.category_name || "Uncategorized"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        ₹{product.sale_price || product.base_price}
                                    </div>
                                    {product.sale_price && (
                                        <div className="text-xs text-gray-500 line-through">
                                            ₹{product.base_price}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {product.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        href={`/products/${product.slug}`}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4 inline" />
                                    </Link>
                                    <button
                                        onClick={() => handleDuplicate(product.id)}
                                        className="text-gray-600 hover:text-gray-900 mr-4"
                                        title="Duplicate"
                                    >
                                        <Copy className="h-4 w-4 inline" />
                                    </button>
                                    <button
                                        onClick={() => handleArchive(product.id)}
                                        className="text-yellow-600 hover:text-yellow-900 mr-4"
                                        title="Archive"
                                    >
                                        <Archive className="h-4 w-4 inline" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="h-4 w-4 inline" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
