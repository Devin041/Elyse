"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Save, Trash2, Package, Image as LucideImage, ImageIcon, Copy, Wand2, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import VariantImageModal from "@/components/VariantImageModal";
import VariantMatrix from "@/components/VariantMatrix";
import BulkVariantModal from "@/components/BulkVariantModal";

interface Variant {
    id: string;
    sku: string;
    size: string;
    color: string | null;
    color_hex: string | null;
    inventory_count: number;
    images?: { url: string }[];
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [productId, setProductId] = useState<string>("");
    const [variants, setVariants] = useState<Variant[]>([]);
    const [productImages, setProductImages] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [newVariant, setNewVariant] = useState({
        size: '',
        color: '',
        colorHex: '',
        sku: '',
        inventoryCount: 0
    });
    const [addingVariant, setAddingVariant] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        basePrice: "",
        salePrice: "",
        categoryId: "",
        sku: "",
        isFeatured: false,
        isNewArrival: false,
        isActive: true,
        tags: [] as string[],
    });

    useEffect(() => {
        if (slug && slug !== 'undefined') {
            fetchProduct();
        }
        fetchCategories();
    }, [slug]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchProduct = async () => {
        try {
            const { data } = await api.get(`/products/${slug}`);
            const product = data.data;

            setProductId(product.id);
            setVariants(product.variants || []);
            setProductImages(product.images?.map((img: any) => img.url) || []);
            setFormData({
                name: product.name,
                slug: product.slug,
                description: product.description || "",
                basePrice: product.base_price.toString(),
                salePrice: product.sale_price ? product.sale_price.toString() : "",
                categoryId: product.category_id || "c2cb0b07-86ef-4b5e-b2c0-466fa8a1cd50",
                sku: product.sku || "",
                isFeatured: product.is_featured,
                isNewArrival: product.is_new_arrival || false,
                isActive: product.is_active,
                tags: product.tags || [],
            });
        } catch (error) {
            toast.error("Failed to fetch product details");
            router.push("/products");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put(`/products/${productId}`, {
                ...formData,
                basePrice: Number(formData.basePrice),
                salePrice: formData.salePrice ? Number(formData.salePrice) : null,
                images: productImages,
                tags: formData.tags,
            });
            toast.success("Product updated successfully");
            router.push("/products");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    const updateVariantInventory = async (variantId: string, newCount: number) => {
        try {
            await api.patch(`/products/variants/${variantId}/inventory`, {
                inventoryCount: newCount,
            });

            // Update local state
            setVariants(variants.map(v =>
                v.id === variantId ? { ...v, inventory_count: newCount } : v
            ));

            toast.success("Inventory updated");
        } catch (error) {
            toast.error("Failed to update inventory");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

        try {
            await api.delete(`/products/${productId}`);
            toast.success("Product deleted");
            router.push("/products");
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    const handleDuplicate = async () => {
        if (!confirm("Duplicate this product?")) return;

        try {
            const { data } = await api.post(`/products/${productId}/duplicate`);
            toast.success("Product duplicated");
            router.push(`/products/${data.data.slug}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to duplicate product");
        }
    };

    const handleAddVariant = async () => {
        if (!newVariant.size || !newVariant.sku || newVariant.inventoryCount < 0) {
            toast.error('Please fill all required fields');
            return;
        }

        setAddingVariant(true);
        try {
            await api.post('/products/variants', {
                productId: productId,
                sku: newVariant.sku,
                size: newVariant.size,
                color: newVariant.color || null,
                colorHex: newVariant.colorHex || null,
                inventoryCount: newVariant.inventoryCount,
            });

            toast.success('Variant added successfully');

            // Reset form
            setNewVariant({ size: '', color: '', colorHex: '', sku: '', inventoryCount: 0 });

            // Refresh product data
            await fetchProduct();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add variant');
        } finally {
            setAddingVariant(false);
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
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <Link
                        href="/products"
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Products
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900 mt-2">
                        Edit Product
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {formData.name}
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleDuplicate}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                    </button>
                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Product
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Left 2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Image Management */}
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <div className="flex items-center mb-6">
                            <ImageIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <h2 className="text-lg font-bold text-gray-900">Product Images</h2>
                        </div>
                        <ImageUploader
                            onImagesUploaded={setProductImages}
                            onBusyChange={setImageUploading}
                            maxImages={8}
                            initialImages={productImages}
                        />
                    </div>

                    {/* Product Details Form */}
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <div className="flex items-center mb-6">
                            <Package className="h-5 w-5 text-gray-400 mr-2" />
                            <h2 className="text-lg font-bold text-gray-900">Product Details</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                        placeholder="Enter product name"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        readOnly
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                        placeholder="Describe your product..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                                    {loadingCategories ? (
                                        <div className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm text-gray-400 bg-gray-50">
                                            Loading categories...
                                        </div>
                                    ) : (
                                        <select
                                            required
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Base Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.basePrice}
                                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sale Price (Optional)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.salePrice}
                                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Base SKU</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                        placeholder="e.g. TST-001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        value={formData.isActive ? "active" : "inactive"}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "active" })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Draft / Inactive</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Tags (Comma separated - e.g. cocktail, wedding)</label>
                                    <input
                                        type="text"
                                        value={formData.tags.join(", ")}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            tags: e.target.value.split(",").map(t => t.trim()).filter(t => t !== "")
                                        })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                        placeholder="e.g. cocktail, wedding, summer"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Use <strong>cocktail</strong> for "COCKTAIL CHARM" tab and <strong>wedding</strong> for "WEDDING DAY ELEGANCE".
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center">
                                    <input
                                        id="isFeatured"
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                    />
                                    <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900 font-medium">
                                        Featured Product (Show on Homepage)
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="isNewArrival"
                                        type="checkbox"
                                        checked={formData.isNewArrival}
                                        onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                    />
                                    <label htmlFor="isNewArrival" className="ml-2 block text-sm text-gray-900 font-medium">
                                        New Arrival (Show on "New In" Page)
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end pt-5 border-t space-x-3">
                                <button
                                    type="button"
                                    onClick={() => router.push("/products")}
                                    className="bg-white py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || imageUploading}
                                    className="inline-flex justify-center py-2 px-8 border border-transparent shadow-lg text-sm font-bold rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none transition-all disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar (Right 1/3) */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden flex flex-col">
                        {/* Variants Header */}
                        <div className="bg-gray-50 p-6 border-b border-gray-100">
                            <div className="flex items-center">
                                <Package className="h-5 w-5 text-gray-400 mr-2" />
                                <h2 className="text-lg font-bold text-gray-900">Inventory & Variants</h2>
                            </div>
                        </div>

                        {/* Variants List (Scrollable) */}
                        <div className="p-6 flex-1 overflow-y-auto max-h-[600px] bg-white">
                            {variants.length > 0 ? (
                                <div className="space-y-6">
                                    {Object.entries(
                                        variants.reduce((acc: Record<string, typeof variants>, v) => {
                                            const colorKey = v.color || 'No Color';
                                            if (!acc[colorKey]) acc[colorKey] = [];
                                            acc[colorKey].push(v);
                                            return acc;
                                        }, {})
                                    ).map(([colorName, colorVariants]) => (
                                        <div key={colorName} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200/50">
                                                <div className="flex items-center">
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-200 mr-2 shadow-sm"
                                                        style={{ backgroundColor: colorVariants[0].color_hex || '#eee' }}
                                                    />
                                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{colorName}</h3>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedVariant(colorVariants[0]);
                                                        setIsImageModalOpen(true);
                                                    }}
                                                    className="flex flex-col items-end gap-1"
                                                >
                                                    <span className="flex items-center text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors">
                                                        <LucideImage className="h-3 w-3 mr-1" />
                                                        Images
                                                    </span>
                                                    {/* Show indicator if these variants have specific images assigned */}
                                                    {variants.some(v => v.color === colorName && (v as any).images && (v as any).images.length > 0) && (
                                                        <span className="text-[8px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                            Overrides Main
                                                        </span>
                                                    )}
                                                </button>
                                            </div>

                                            <div className="space-y-2.5">
                                                {colorVariants.map((variant) => (
                                                    <div key={variant.id} className="flex items-center justify-between text-sm bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                        <div className="flex-1">
                                                            <div className="font-bold text-gray-900">{variant.size}</div>
                                                            <div className="text-[10px] text-gray-400 font-mono uppercase truncate w-24">{variant.sku}</div>
                                                        </div>
                                                        <div className="w-20">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                className="block w-full border border-gray-200 rounded-lg py-1.5 px-2 text-xs font-bold text-center focus:ring-1 focus:ring-black"
                                                                defaultValue={variant.inventory_count}
                                                                onBlur={(e) => {
                                                                    const newValue = parseInt(e.target.value);
                                                                    if (newValue !== variant.inventory_count && !isNaN(newValue)) {
                                                                        updateVariantInventory(variant.id, newValue);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            Total Units:
                                        </p>
                                        <span className="text-lg font-black text-gray-900">
                                            {variants.reduce((sum, v) => sum + v.inventory_count, 0)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 px-4">
                                    <Package className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-gray-400">No variants created yet.</p>
                                </div>
                            )}

                            {/* Add New Variant Options */}
                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsBulkModalOpen(true)}
                                    className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-gray-900 hover:bg-black text-white rounded-2xl shadow-xl transition-all transform active:scale-[0.98] font-black text-sm uppercase tracking-widest mb-6"
                                >
                                    <Wand2 className="h-5 w-5" />
                                    <span>Open Bulk Matrix</span>
                                </button>

                                <p className="text-[10px] text-gray-300 text-center uppercase tracking-[0.2em] font-black mb-6">
                                    — OR ADD SINGLE —
                                </p>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Size *</label>
                                            <input
                                                type="text"
                                                value={newVariant.size}
                                                onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                                                className="block w-full border border-gray-200 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-black transition-all"
                                                placeholder="e.g. XL"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Stock *</label>
                                            <input
                                                type="number"
                                                value={newVariant.inventoryCount}
                                                onChange={(e) => setNewVariant({ ...newVariant, inventoryCount: parseInt(e.target.value) || 0 })}
                                                className="block w-full border border-gray-200 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-black transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">SKU Pattern *</label>
                                        <input
                                            type="text"
                                            value={newVariant.sku}
                                            onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                                            className="block w-full border border-gray-200 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-black transition-all font-mono uppercase"
                                            placeholder="AUTO-GENERATED"
                                        />
                                    </div>

                                    <div className="grid grid-cols-5 gap-3">
                                        <div className="col-span-3">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Color Name</label>
                                            <input
                                                type="text"
                                                value={newVariant.color}
                                                onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                                                className="block w-full border border-gray-200 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-black transition-all"
                                                placeholder="Olive"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">HEX</label>
                                            <div className="relative h-12 w-full">
                                                <input
                                                    type="color"
                                                    value={newVariant.colorHex || "#ffffff"}
                                                    onChange={(e) => setNewVariant({ ...newVariant, colorHex: e.target.value })}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer p-0"
                                                />
                                                <div
                                                    className="w-full h-full rounded-xl border border-gray-200 shadow-sm transition-transform hover:scale-[1.02]"
                                                    style={{ backgroundColor: newVariant.colorHex || "#ffffff" }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddVariant}
                                        disabled={addingVariant || !newVariant.size || !newVariant.sku}
                                        className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl text-gray-900 bg-white border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all transform active:scale-[0.98] disabled:opacity-30 font-black text-xs uppercase tracking-[0.2em] shadow-lg"
                                    >
                                        {addingVariant ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                        <span>Create Variant</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Modals */}
            <BulkVariantModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                productId={productId}
                productSlug={formData.slug}
                productImages={productImages}
                onSuccess={fetchProduct}
            />

            {selectedVariant && (
                <VariantImageModal
                    isOpen={isImageModalOpen}
                    onClose={() => {
                        setIsImageModalOpen(false);
                        setSelectedVariant(null);
                    }}
                    variantId={selectedVariant.id}
                    variantName={`${selectedVariant.size || ''} ${selectedVariant.color ? `- ${selectedVariant.color}` : ''}`}
                />
            )}
        </div>
    );
}
