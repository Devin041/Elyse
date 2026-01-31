"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye, Upload, X } from "lucide-react";
import Link from "next/link";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { giftCardsBannerSchema } from '@/lib/validations/landingPage';
import { toast } from 'react-hot-toast';
import type { z } from 'zod';
import ImageUploader from "@/components/ImageUploader";

type GiftCardsFormData = z.infer<typeof giftCardsBannerSchema>;

export default function GiftCardsBannerPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [useCustomLink, setUseCustomLink] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
        reset,
    } = useForm<GiftCardsFormData>({
        resolver: zodResolver(giftCardsBannerSchema),
        defaultValues: {
            title: "",
            description: "",
            ctaText: "",
            ctaLink: "",
            backgroundImageUrl: "",
            overlayOpacity: 40,
            textColor: "#FFFFFF",
            buttonColor: "#3B82F6",
            buttonTextColor: "#FFFFFF",
            isEnabled: true
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/landing-page/gift-cards');
                if (!res.ok) throw new Error('Failed to fetch gift cards banner');
                const data = await res.json();

                if (data) {
                    reset({
                        title: data.title || "",
                        description: data.description || "",
                        ctaText: data.cta_text || "",
                        ctaLink: data.cta_link || "",
                        backgroundImageUrl: data.background_image_url || "",
                        isEnabled: data.is_enabled ?? true,
                        // Config fields (Directly from table columns)
                        overlayOpacity: data.overlay_opacity ?? 40,
                        textColor: data.text_color || "#FFFFFF",
                        buttonColor: data.button_bg_color || "#3B82F6",
                        buttonTextColor: data.button_text_color || "#FFFFFF",
                    });
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load banner data");
            } finally {
                setIsLoading(false);
            }
        };

        const fetchOptions = async () => {
            try {
                const [catsRes, colsRes] = await Promise.all([
                    fetch('/api/categories?includeInactive=true'),
                    fetch('/api/collections')
                ]);

                if (catsRes.ok) {
                    const catsData = await catsRes.json();
                    setCategories(catsData.data || []);
                }

                if (colsRes.ok) {
                    const colsData = await colsRes.json();
                    setCollections(colsData.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch link options:', error);
            }
        };

        fetchData();
        fetchOptions();
    }, [reset]);

    // Watch values for preview
    const formData = watch();

    const onSubmit = async (data: GiftCardsFormData) => {
        try {
            const payload = {
                title: data.title || null,
                description: data.description || null,
                background_image_url: data.backgroundImageUrl || null,
                cta_text: data.ctaText || 'Buy Gift Card',
                cta_link: data.ctaLink || '/gift-cards',
                is_enabled: data.isEnabled ?? true,
                overlay_opacity: data.overlayOpacity ?? 40,
                text_color: data.textColor || '#FFFFFF',
                button_bg_color: data.buttonColor || '#3B82F6',
                button_text_color: data.buttonTextColor || '#FFFFFF'
            };

            const res = await fetch('/api/landing-page/gift-cards', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to update banner');

            toast.success("Gift Cards banner saved successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save changes. Please try again.");
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

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
                        Back to Landing Page
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Gift Cards Banner
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Promotional banner for gift cards
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="button" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Content */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    {...register("title")}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., Gift Cards Available (Optional)"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    {...register("description")}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Describe your gift card offering..."
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Call to Action</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Button Text <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("ctaText")}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.ctaText ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., Buy Gift Card"
                                />
                                {errors.ctaText && (
                                    <p className="text-red-500 text-sm mt-1">{errors.ctaText.message}</p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Link <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setUseCustomLink(!useCustomLink)}
                                        className="text-xs text-blue-600 hover:text-blue-500"
                                    >
                                        {useCustomLink ? "Select from list" : "Enter custom URL"}
                                    </button>
                                </div>

                                {useCustomLink ? (
                                    <input
                                        type="text"
                                        {...register("ctaLink")}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.ctaLink ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="/gift-cards"
                                    />
                                ) : (
                                    <select
                                        {...register("ctaLink")}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.ctaLink ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Select a page</option>

                                        <optgroup label="Collections">
                                            {collections.map(col => (
                                                <option key={col.id} value={`/collections/${col.slug}`}>
                                                    {col.name} (/collections/{col.slug})
                                                </option>
                                            ))}
                                        </optgroup>

                                        <optgroup label="Categories">
                                            {categories.map(cat => (
                                                <option key={cat.id} value={`/collections/${cat.slug}`}>
                                                    {cat.name} (/collections/{cat.slug})
                                                </option>
                                            ))}
                                        </optgroup>

                                        <optgroup label="Other Pages">
                                            <option value="/gift-cards">Gift Cards</option>
                                            <option value="/about">About Us</option>
                                            <option value="/contact">Contact Us</option>
                                            <option value="/blog">Blog</option>
                                        </optgroup>
                                    </select>
                                )}
                                {errors.ctaLink && (
                                    <p className="text-red-500 text-sm mt-1">{errors.ctaLink.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Background & Styling */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Background & Styling</h2>

                        <div className="space-y-4">
                            {/* Background Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Background Image
                                </label>
                                <ImageUploader
                                    onImagesUploaded={(urls) => setValue("backgroundImageUrl", urls[0])}
                                    maxImages={1}
                                    initialImages={formData.backgroundImageUrl ? [formData.backgroundImageUrl] : []}
                                    aspectRatio={16 / 5}
                                    cropTitle="Crop Banner Image"
                                />
                            </div>

                            {/* Overlay Opacity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Overlay Opacity: {formData.overlayOpacity}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    {...register("overlayOpacity", { valueAsNumber: true })}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Transparent</span>
                                    <span>Opaque</span>
                                </div>
                            </div>

                            {/* Colors */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Text Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.textColor || "#FFFFFF"}
                                            onChange={(e) => setValue("textColor", e.target.value.toUpperCase())}
                                            className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            {...register("textColor")}
                                            className={`flex-1 px-3 py-2 border rounded-md text-sm ${errors.textColor ? 'border-red-500' : 'border-gray-300'}`}
                                            onChange={(e) => setValue("textColor", e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    {errors.textColor && (
                                        <p className="text-red-500 text-sm mt-1">{errors.textColor.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Button Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.buttonColor || "#3B82F6"}
                                            onChange={(e) => setValue("buttonColor", e.target.value.toUpperCase())}
                                            className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            {...register("buttonColor")}
                                            className={`flex-1 px-3 py-2 border rounded-md text-sm ${errors.buttonColor ? 'border-red-500' : 'border-gray-300'}`}
                                            onChange={(e) => setValue("buttonColor", e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    {errors.buttonColor && (
                                        <p className="text-red-500 text-sm mt-1">{errors.buttonColor.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Button Text
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.buttonTextColor || "#FFFFFF"}
                                            onChange={(e) => setValue("buttonTextColor", e.target.value.toUpperCase())}
                                            className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            {...register("buttonTextColor")}
                                            className={`flex-1 px-3 py-2 border rounded-md text-sm ${errors.buttonTextColor ? 'border-red-500' : 'border-gray-300'}`}
                                            onChange={(e) => setValue("buttonTextColor", e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    {errors.buttonTextColor && (
                                        <p className="text-red-500 text-sm mt-1">{errors.buttonTextColor.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>

                        <div
                            className="relative rounded-lg overflow-hidden"
                            style={{
                                backgroundImage: formData.backgroundImageUrl ? `url(${formData.backgroundImageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                minHeight: '200px'
                            }}
                        >
                            {/* Overlay */}
                            <div
                                className="absolute inset-0 bg-black"
                                style={{ opacity: (formData.overlayOpacity || 0) / 100 }}
                            />

                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 min-h-[200px]">
                                {formData.title && (
                                    <h2
                                        className="text-3xl font-bold mb-2 uppercase tracking-wider"
                                        style={{ color: formData.textColor, letterSpacing: '2px' }}
                                    >
                                        {formData.title}
                                    </h2>
                                )}
                                {formData.description && (
                                    <p
                                        className="text-md mb-6 max-w-2xl font-light italic"
                                        style={{ color: formData.textColor, opacity: 0.9 }}
                                    >
                                        {formData.description}
                                    </p>
                                )}
                                <button
                                    className="rounded-sm font-semibold text-lg transition-all duration-500 border border-white/80 backdrop-blur-sm"
                                    style={{
                                        backgroundColor: formData.buttonColor,
                                        color: formData.buttonTextColor,
                                        padding: '16px 42px',
                                        letterSpacing: '2px',
                                        textTransform: 'uppercase',
                                        fontSize: '13px'
                                    }}
                                >
                                    {formData.ctaText || "Button"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Settings */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>

                        <div className="space-y-4">
                            <div className="pt-4 border-t border-gray-200">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        {...register("isEnabled")}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        Enable this banner
                                    </span>
                                </label>
                                <p className="ml-6 text-xs text-gray-500 mt-1">
                                    Disabled banners won't be shown on the landing page
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
