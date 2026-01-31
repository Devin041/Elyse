"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";

export default function NewCategoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        imageUrl: "",
        posterUrl: "",
        isActive: true,
    });

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

    const handleImageUploaded = (urls: string[]) => {
        if (urls.length > 0) {
            setFormData({ ...formData, imageUrl: urls[0] });
        } else {
            setFormData({ ...formData, imageUrl: "" });
        }
    };

    const handlePosterUploaded = (urls: string[]) => {
        if (urls.length > 0) {
            setFormData({ ...formData, posterUrl: urls[0] });
        } else {
            setFormData({ ...formData, posterUrl: "" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/categories", formData);
            toast.success("Category created successfully");
            router.push("/categories");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <Link
                    href="/categories"
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Categories
                </Link>
                <h1 className="text-2xl font-semibold text-gray-900 mt-2">
                    Add New Category
                </h1>
            </div>

            <div className="bg-white shadow sm:rounded-lg p-6 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Category Name
                        </label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                            value={formData.name}
                            onChange={handleNameChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Slug
                        </label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                            value={formData.slug}
                            readOnly
                        />
                    </div>

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
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thumbnail Image (Grid View)
                        </label>
                        <ImageUploader
                            onImagesUploaded={handleImageUploaded}
                            maxImages={1}
                            aspectRatio={3 / 4}
                            cropTitle="Crop Category Thumbnail"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Poster Banner (Category Page)
                        </label>
                        <ImageUploader
                            onImagesUploaded={handlePosterUploaded}
                            maxImages={1}
                            aspectRatio={16 / 5}
                            cropTitle="Crop Category Banner"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            id="isActive"
                            type="checkbox"
                            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                            checked={formData.isActive}
                            onChange={(e) =>
                                setFormData({ ...formData, isActive: e.target.checked })
                            }
                        />
                        <label
                            htmlFor="isActive"
                            className="ml-2 block text-sm text-gray-900"
                        >
                            Active
                        </label>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                "Create Category"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
