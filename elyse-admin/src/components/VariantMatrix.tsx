"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Wand2, Image as LucideImage, Save, X } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface VariantMatrixProps {
    productId: string;
    productSlug: string;
    productImages?: string[];
    onSuccess: () => void;
}

interface ColorDef {
    name: string;
    hex: string;
    imageUrls: string[];
}

interface GeneratedVariant {
    size: string;
    color: string;
    colorHex: string;
    sku: string;
    inventoryCount: number;
    price: number;
    imageUrls: string[];
}

export default function VariantMatrix({ productId, productSlug, productImages = [], onSuccess }: VariantMatrixProps) {
    const [sizes, setSizes] = useState<string>(""); // Comma separated
    const [colors, setColors] = useState<ColorDef[]>([{ name: "", hex: "", imageUrls: [] }]);
    const [basePrice, setBasePrice] = useState<number>(0);
    const [baseStock, setBaseStock] = useState<number>(50);

    const [previewVariants, setPreviewVariants] = useState<GeneratedVariant[]>([]);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);

    const addColor = () => {
        setColors([...colors, { name: "", hex: "", imageUrls: [] }]);
    };

    const removeColor = (index: number) => {
        setColors(colors.filter((_, i) => i !== index));
    };

    const updateColor = (index: number, field: keyof ColorDef, value: string) => {
        const newColors = [...colors];
        newColors[index] = { ...newColors[index], [field]: value } as ColorDef;
        setColors(newColors);
    };

    const generateMatrix = () => {
        setGenerating(true);
        const sizeList = sizes.split(",").map(s => s.trim()).filter(s => s);
        const colorList = colors.filter(c => c.name || c.hex); // Accept rows with just Hex

        if (sizeList.length === 0) {
            toast.error("Please enter at least one size");
            setGenerating(false);
            return;
        }

        const variants: GeneratedVariant[] = [];

        // If no colors, just sizes
        if (colorList.length === 0) {
            sizeList.forEach(size => {
                variants.push({
                    size,
                    color: "",
                    colorHex: "",
                    sku: `${productSlug}-${size}`.toUpperCase(),
                    inventoryCount: baseStock,
                    price: basePrice,
                    imageUrls: []
                });
            });
        } else {
            // Matrix: Size x Color
            sizeList.forEach(size => {
                colorList.forEach(color => {
                    // Fallback to Hex as name if empty
                    const finalName = color.name.trim() || color.hex.toUpperCase();
                    // SKU Format: SLUG-SIZE-COLORCODE (First 3 chars of color name or hex)
                    const colorCode = (color.name.trim() || color.hex.replace('#', '')).substring(0, 3).toUpperCase();

                    variants.push({
                        size,
                        color: finalName,
                        colorHex: color.hex,
                        sku: `${productSlug}-${size}-${colorCode}`.toUpperCase(),
                        inventoryCount: baseStock,
                        price: basePrice,
                        imageUrls: color.imageUrls || []
                    });
                });
            });
        }

        setPreviewVariants(variants);
        setGenerating(false);
    };

    const handleRowImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newUrls: string[] = [];
        toast.loading("Uploading images...", { id: "uploading" });

        try {
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append("image", files[i]);
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                if (res.ok) {
                    const data = await res.json();
                    newUrls.push(data.data.url);
                }
            }

            const newColors = [...colors];
            newColors[index] = {
                ...newColors[index],
                imageUrls: [...newColors[index].imageUrls, ...newUrls]
            };
            setColors(newColors);
            toast.success(`${newUrls.length} images added to ${newColors[index].name || 'color'}`, { id: "uploading" });
        } catch (error) {
            toast.error("Upload failed", { id: "uploading" });
        }
    };

    const removeRowImage = (colorIndex: number, imgIndex: number) => {
        const newColors = [...colors];
        newColors[colorIndex].imageUrls = newColors[colorIndex].imageUrls.filter((_, i) => i !== imgIndex);
        setColors(newColors);
    };

    const toggleExistingImage = (colorIndex: number, url: string) => {
        const newColors = [...colors];
        const currentUrls = newColors[colorIndex].imageUrls || [];
        if (currentUrls.includes(url)) {
            newColors[colorIndex].imageUrls = currentUrls.filter(u => u !== url);
        } else {
            newColors[colorIndex].imageUrls = [...currentUrls, url];
        }
        setColors(newColors);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post(`/products/${productId}/variants/bulk`, {
                variants: previewVariants
            });
            toast.success(`${previewVariants.length} variants created successfully`);
            setPreviewVariants([]);
            setSizes("");
            setColors([{ name: "", hex: "", imageUrls: [] }]);
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create variants");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 min-h-[500px]">
            {/* Header section with instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
                <div className="p-1 bg-blue-500 rounded text-white mt-0.5">
                    <Wand2 className="h-4 w-4" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-blue-900">How it works</h4>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                        Enter multiple sizes (e.g. S, M, L) and add different colors. We'll generate a separate variant for every combination.
                        You can also associate multiple images with each color row to auto-apply them.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Column 1: Configuration (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 border-gray-200">
                            1. Global Setup
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-2">
                                    Available Sizes
                                </label>
                                <input
                                    type="text"
                                    value={sizes}
                                    onChange={(e) => setSizes(e.target.value)}
                                    placeholder="e.g. S, M, L, XL"
                                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all sm:text-sm"
                                />
                                <p className="mt-1.5 text-[10px] text-gray-400 font-medium">Use commas to separate sizes</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-2">
                                        Base Stock
                                    </label>
                                    <input
                                        type="number"
                                        value={baseStock}
                                        onChange={(e) => setBaseStock(parseInt(e.target.value) || 0)}
                                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-2">
                                        Base Price
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-400 font-medium sm:text-sm">₹</span>
                                        <input
                                            type="number"
                                            value={basePrice}
                                            onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 pl-7 pr-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={generateMatrix}
                        disabled={generating || !sizes}
                        className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl text-white bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-800 shadow-lg transform active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                    >
                        {generating ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Wand2 className="h-5 w-5" />
                                <span>Preview Combinations</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Column 2: Color Management (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                            2. Color & Image Mapping
                        </h3>
                        <button
                            onClick={addColor}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add New Color
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {colors.map((color, index) => (
                            <div key={index} className="group flex items-center space-x-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-black/20 hover:shadow-lg transition-all">
                                {/* Color Name */}
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Color Identity</label>
                                    <input
                                        type="text"
                                        value={color.name}
                                        onChange={(e) => updateColor(index, "name", e.target.value)}
                                        placeholder="Color Name (e.g. Olive)"
                                        className="block w-full border-0 border-b border-gray-100 focus:border-black focus:ring-0 p-1 text-sm font-bold transition-colors placeholder:text-gray-300"
                                    />
                                </div>

                                {/* Multi-Image Manager */}
                                <div className="flex flex-col space-y-2.5 min-w-[280px]">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Gallery & Assets</label>
                                    <div className="flex items-center space-x-2">
                                        <label className="cursor-pointer bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-xl transition-all flex items-center space-x-2 shadow-sm transform active:scale-95">
                                            <Plus size={14} strokeWidth={3} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Upload New</span>
                                            <input
                                                type="file"
                                                multiple
                                                className="hidden"
                                                onChange={(e) => handleRowImageUpload(index, e)}
                                                accept="image/*"
                                            />
                                        </label>

                                        {productImages.length > 0 && (
                                            <div className="relative group/popover">
                                                <button
                                                    type="button"
                                                    className="bg-white border border-gray-200 hover:border-black text-gray-700 px-3 py-2 rounded-xl transition-all flex items-center space-x-2 shadow-sm"
                                                >
                                                    <LucideImage size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Select Existing</span>
                                                </button>

                                                <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 hidden group-hover/popover:grid grid-cols-4 gap-2 w-64 animate-in fade-in zoom-in duration-200 ring-1 ring-black/5">
                                                    {productImages.map((img, i) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => toggleExistingImage(index, img)}
                                                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${color.imageUrls?.includes(img) ? 'border-black ring-2 ring-black/10' : 'border-transparent hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <img src={img} className="w-full h-full object-cover" />
                                                            {color.imageUrls?.includes(img) && (
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                                    <div className="bg-white rounded-full p-1 shadow-lg">
                                                                        <Plus size={10} className="rotate-45 text-black" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Thumbnails Preview */}
                                    {color.imageUrls?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {color.imageUrls.map((url, imgIdx) => (
                                                <div key={imgIdx} className="relative h-12 w-12 group/thumb">
                                                    <img src={url} className="h-full w-full object-cover rounded-xl border border-gray-200 shadow-sm transition-transform group-hover/thumb:scale-105" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRowImage(index, imgIdx)}
                                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/thumb:opacity-100 transition-all shadow-lg hover:bg-red-600 border-2 border-white"
                                                    >
                                                        <X size={10} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Hex Picker */}
                                <div className="flex flex-col space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Hex Code</label>
                                    <div className="flex items-center space-x-3 bg-gray-50/50 p-1.5 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                                        <div className="relative h-8 w-8 flex-shrink-0">
                                            <input
                                                type="color"
                                                value={color.hex || "#000000"}
                                                onChange={(e) => updateColor(index, "hex", e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer p-0"
                                            />
                                            <div
                                                className="w-full h-full rounded-lg border-2 border-white shadow-sm ring-1 ring-gray-200"
                                                style={{ backgroundColor: color.hex || "#fff" }}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={color.hex}
                                            onChange={(e) => updateColor(index, "hex", e.target.value)}
                                            placeholder="#000"
                                            className="w-16 border-0 bg-transparent text-[11px] font-mono font-black uppercase focus:ring-0 p-0 text-gray-700"
                                            maxLength={7}
                                        />
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <div className="pt-4">
                                    <button
                                        type="button"
                                        onClick={() => removeColor(index)}
                                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            {previewVariants.length > 0 && (
                <div className="mt-10 pt-10 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">
                                3. Generation Preview
                            </h3>
                            <p className="text-xs text-gray-500">Confirm all combinations before saving</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Total: {previewVariants.length} Combinations
                            </span>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center space-x-2 py-3 px-8 rounded-xl text-white bg-black hover:bg-gray-800 shadow-xl transition-all disabled:opacity-50 font-bold"
                            >
                                {saving ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        <span>Confirm & Create All</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-inner bg-gray-50/30">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-100/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">SKU Pattern</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Size</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Color Details</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock & Price</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/40 divide-y divide-gray-100">
                                {previewVariants.map((variant, idx) => (
                                    <tr key={idx} className="hover:bg-white transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-[11px] font-black font-mono text-gray-400 uppercase tracking-tighter">
                                            {variant.sku}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black bg-gray-100 text-gray-800 uppercase tracking-widest">
                                                {variant.size}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                                                    {variant.imageUrls?.map((url, i) => (
                                                        <img key={i} src={url} className="h-9 w-9 rounded-xl border-2 border-white object-cover shadow-md bg-gray-50 ring-1 ring-black/5" />
                                                    ))}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full border border-gray-200 shadow-inner"
                                                        style={{ backgroundColor: variant.colorHex }}
                                                    />
                                                    <span className="text-xs font-bold text-gray-700">{variant.color}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="text-sm font-black text-gray-900">₹{variant.price.toLocaleString()}</div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">{variant.inventoryCount} IN STOCK</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
