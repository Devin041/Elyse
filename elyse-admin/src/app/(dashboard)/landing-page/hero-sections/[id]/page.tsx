"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, Save, Eye, Trash2, Upload, X, Film, Play } from "lucide-react";
import Link from "next/link";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { heroSectionSchema } from '@/lib/validations/landingPage';
import { toast } from 'react-hot-toast';
import type { z } from 'zod';
import { useRouter } from 'next/navigation';
import VideoUploader from "@/components/VideoUploader";
import ImageUploader from "@/components/ImageUploader";

type HeroSectionFormData = z.infer<typeof heroSectionSchema>;

export default function HeroSectionEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
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
    } = useForm<HeroSectionFormData>({
        resolver: zodResolver(heroSectionSchema),
        defaultValues: {
            title: "",
            titleStyle: "outline",
            subtitle: "",
            backgroundType: "image",
            backgroundGradient: {
                start: "#FFD700",
                end: "#FFA500"
            },
            videoSettings: {
                videoUrl: "",
                fallbackImageUrl: "",
                autoplay: true,
                loop: true,
                muted: true,
                controls: false
            },
            leftImage: "",
            rightImages: [],
            ctaText: "",
            ctaLink: "",
            height: "full",
            isEnabled: true,
            typography: {
                title: {
                    fontFamily: "Inter",
                    fontSize: " clamp(48px, 8vw, 96px)",
                    color: "#FFFFFF",
                    useGradient: false,
                    gradient: {
                        start: "#FFD700",
                        end: "#FFA500"
                    }
                },
                subtitle: {
                    fontFamily: "Inter",
                    fontSize: "clamp(14px, 2vw, 18px)",
                    color: "#FFFFFF"
                }
            }
        },
    });


    // Fetch data on mount
    useEffect(() => {
        const fetchHero = async () => {
            try {
                const res = await fetch(`/api/landing-page/hero-sections/${id}`);
                if (!res.ok) throw new Error('Failed to fetch hero section');
                const data = await res.json();

                // Map API data to form data
                reset({
                    title: data.title,
                    subtitle: data.subtitle,
                    ctaText: data.cta_text,
                    ctaLink: data.cta_link,
                    isEnabled: data.is_enabled,
                    backgroundType: data.background_type || 'image',
                    // Config fields
                    titleStyle: data.config?.titleStyle || 'outline',
                    backgroundGradient: data.config?.backgroundGradient || { start: "#FFD700", end: "#FFA500" },
                    videoSettings: data.config?.videoSettings || {
                        videoUrl: "",
                        fallbackImageUrl: "",
                        autoplay: true,
                        loop: true,
                        muted: true,
                        controls: false
                    },
                    leftImage: data.config?.leftImage || "",
                    rightImages: data.config?.rightImages || [],
                    height: data.config?.height || "full",
                    typography: data.config?.typography || {
                        title: {
                            fontFamily: "Inter",
                            fontSize: "clamp(48px, 8vw, 96px)",
                            color: "#FFFFFF",
                            useGradient: false,
                            gradient: {
                                start: "#FFD700",
                                end: "#FFA500"
                            }
                        },
                        subtitle: {
                            fontFamily: "Inter",
                            fontSize: "clamp(14px, 2vw, 18px)",
                            color: "#FFFFFF"
                        }
                    }
                });

            } catch (error) {
                console.error(error);
                toast.error("Failed to load hero section");
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

        fetchHero();
        fetchOptions();
    }, [id, reset]);

    // Watch values for conditional rendering and preview
    const backgroundType = watch("backgroundType");
    const backgroundGradient = watch("backgroundGradient");
    const videoSettings = watch("videoSettings");
    const leftImage = watch("leftImage");
    const rightImages = watch("rightImages");
    const title = watch("title");
    const typographyValue = watch("typography");


    const onSubmit = async (data: HeroSectionFormData) => {
        try {
            const payload = {
                title: data.title,
                subtitle: data.subtitle,
                cta_text: data.ctaText || null,
                cta_link: data.ctaLink || null,
                is_enabled: data.isEnabled,
                background_type: data.backgroundType,
                background_image_url: data.backgroundType === 'image' ? data.leftImage : null,
                config: {
                    titleStyle: data.titleStyle,
                    backgroundGradient: data.backgroundGradient,
                    videoSettings: data.videoSettings,
                    leftImage: data.leftImage,
                    rightImages: data.rightImages,
                    height: data.height,
                    typography: data.typography
                }
            };


            console.log('Sending Hero Update Payload:', JSON.stringify(payload, null, 2));

            const res = await fetch(`/api/landing-page/hero-sections/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });


            if (!res.ok) {
                const errorData = await res.json();
                console.error('Save failed:', errorData);
                throw new Error(errorData.details || 'Failed to update hero section');
            }


            toast.success("Hero section saved successfully!");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save changes. Please try again.");
        }
    };

    const addRightImage = () => {
        const currentImages = rightImages || [];
        if (currentImages.length < 3) {
            setValue("rightImages", [...currentImages, "/placeholder.png"]);
        } else {
            toast.error("Maximum 3 right images allowed");
        }
    };

    const removeRightImage = (index: number) => {
        const newImages = [...(rightImages || [])];
        newImages.splice(index, 1);
        setValue("rightImages", newImages);
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
                        Back
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Edit Hero Section: {title}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Section ID: {id}
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
                    {/* Basic Information */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("title")}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., पोली"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                )}
                            </div>


                            {/* Title Style */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title Style <span className="text-gray-400 font-normal">(Effect)</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="outline"
                                            {...register("titleStyle")}
                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Outline</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="filled"
                                            {...register("titleStyle")}
                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Filled</span>
                                    </label>
                                </div>
                            </div>

                            {/* Advanced Typography Controls */}
                            <div className="pt-6 border-t border-gray-100 space-y-6">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Typography Settings</h3>

                                {/* Title Styling */}
                                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                                    <h4 className="text-sm font-medium text-gray-900">Title Styling</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Font Family</label>
                                            <select
                                                {...register("typography.title.fontFamily")}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                            >
                                                <option value="Inter">Inter (Modern Sans)</option>
                                                <option value="Montserrat">Montserrat (Geometric)</option>
                                                <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
                                                <option value="Lora">Lora (Classic Serif)</option>
                                                <option value="Outfit">Outfit (Clean Sans)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Font Size (CSS value)</label>
                                            <input
                                                type="text"
                                                {...register("typography.title.fontSize")}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                placeholder="e.g., 96px or clamp(...)"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                {...register("typography.title.useGradient")}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Use Gradient for Title</span>
                                        </label>

                                        {watch("typography.title.useGradient") ? (
                                            <div className="grid grid-cols-2 gap-4 pl-6">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Start Color</label>
                                                    <input
                                                        type="color"
                                                        {...register("typography.title.gradient.start")}
                                                        className="w-full h-8 p-1 border border-gray-300 rounded"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">End Color</label>
                                                    <input
                                                        type="color"
                                                        {...register("typography.title.gradient.end")}
                                                        className="w-full h-8 p-1 border border-gray-300 rounded"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="pl-6">
                                                <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                                                <input
                                                    type="color"
                                                    {...register("typography.title.color")}
                                                    className="w-24 h-8 p-1 border border-gray-300 rounded"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Subtitle Styling */}
                                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                                    <h4 className="text-sm font-medium text-gray-900">Subtitle Styling</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Font Family</label>
                                            <select
                                                {...register("typography.subtitle.fontFamily")}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                            >
                                                <option value="Inter">Inter (Sans)</option>
                                                <option value="Lora">Lora (Serif)</option>
                                                <option value="Playfair Display">Playfair Display (Serif)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Text Color</label>
                                            <input
                                                type="color"
                                                {...register("typography.subtitle.color")}
                                                className="w-24 h-8 p-1 border border-gray-300 rounded"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Font Size (CSS value)</label>
                                        <input
                                            type="text"
                                            {...register("typography.subtitle.fontSize")}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                            placeholder="e.g., 18px"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subtitle text <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    {...register("subtitle")}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.subtitle ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter subtitle text"
                                />
                                {errors.subtitle && (
                                    <p className="text-red-500 text-sm mt-1">{errors.subtitle.message}</p>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Background Type Selector */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Background</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Background Type
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="gradient"
                                            {...register("backgroundType")}
                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Gradient</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="image"
                                            {...register("backgroundType")}
                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Image</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="video"
                                            {...register("backgroundType")}
                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                                            <Film className="h-4 w-4 mr-1" />
                                            Video
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Gradient Controls */}
                            {backgroundType === "gradient" && (
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Color
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={backgroundGradient?.start || "#FFD700"}
                                                    onChange={(e) => setValue("backgroundGradient.start", e.target.value, { shouldDirty: true })}
                                                    className="h-10 w-16 rounded border border-gray-300 cursor-pointer p-1"
                                                />
                                                <input
                                                    type="text"
                                                    {...register("backgroundGradient.start")}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                                    placeholder="#000000"
                                                />
                                            </div>

                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                End Color
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={backgroundGradient?.end || "#FFA500"}
                                                    onChange={(e) => setValue("backgroundGradient.end", e.target.value, { shouldDirty: true })}
                                                    className="h-10 w-16 rounded border border-gray-300 cursor-pointer p-1"
                                                />
                                                <input
                                                    type="text"
                                                    {...register("backgroundGradient.end")}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                                    placeholder="#000000"
                                                />
                                            </div>

                                        </div>
                                    </div>

                                    {/* Gradient Preview */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preview
                                        </label>
                                        <div
                                            className="h-24 rounded-lg"
                                            style={{
                                                background: `linear-gradient(135deg, ${backgroundGradient?.start} 0%, ${backgroundGradient?.end} 100%)`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}



                            {/* Video Controls */}
                            {backgroundType === "video" && (
                                <div className="pt-4 border-t border-gray-200 space-y-4">
                                    {/* Video Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Background Video <span className="text-red-500">*</span>
                                        </label>
                                        <VideoUploader
                                            initialVideo={videoSettings?.videoUrl}
                                            onVideoUploaded={(url: string) => setValue("videoSettings.videoUrl", url, { shouldDirty: true })}
                                        />
                                    </div>

                                    {/* Fallback Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fallback Image <span className="text-gray-500 text-xs">(if video fails to load)</span>
                                        </label>
                                        <div className="h-48">
                                            <ImageUploader
                                                initialImages={videoSettings?.fallbackImageUrl ? [videoSettings.fallbackImageUrl] : []}
                                                maxImages={1}
                                                onImagesUploaded={(urls: string[]) => setValue("videoSettings.fallbackImageUrl", urls[0] || "", { shouldDirty: true })}
                                            />
                                        </div>
                                    </div>

                                    {/* Video Settings */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Video Settings</h4>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    {...register("videoSettings.autoplay")}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Autoplay</span>
                                            </label>

                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    {...register("videoSettings.loop")}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Loop</span>
                                            </label>

                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    {...register("videoSettings.muted")}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Muted <span className="text-xs text-gray-500">(recommended for autoplay)</span></span>
                                            </label>

                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    {...register("videoSettings.controls")}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Show Controls</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Single Image Background Upload */}
                            {backgroundType === "image" && (
                                <div className="pt-4 border-t border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Background Image <span className="text-red-500">*</span>
                                    </label>
                                    <div className="h-64">
                                        <ImageUploader
                                            initialImages={leftImage ? [leftImage] : []}
                                            maxImages={1}
                                            onImagesUploaded={(urls: string[]) => setValue("leftImage", urls[0] || "", { shouldDirty: true })}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 italic">
                                        This image will fill the entire hero background. For best results, use a high-resolution landscape image.
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Images Section - Only Show for Gradient (Floating Images) */}
                    {backgroundType === "gradient" && (
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Floating Images</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                These images appear as floating elements on top of the gradient background.
                            </p>

                            <div className="space-y-4">
                                {/* Left Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Left Image
                                    </label>
                                    <div className="h-48">
                                        <ImageUploader
                                            initialImages={leftImage ? [leftImage] : []}
                                            maxImages={1}
                                            onImagesUploaded={(urls) => setValue("leftImage", urls[0] || "", { shouldDirty: true })}
                                        />
                                    </div>
                                </div>

                                {/* Right Images */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Right Image(s)
                                    </label>
                                    <ImageUploader
                                        initialImages={rightImages || []}
                                        maxImages={3}
                                        onImagesUploaded={(urls) => setValue("rightImages", urls, { shouldDirty: true })}
                                    />
                                    {errors.rightImages && (
                                        <p className="text-red-500 text-sm mt-1">{errors.rightImages.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}



                    {/* Call to Action */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Call to Action (Optional)</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Button Text
                                </label>
                                <input
                                    type="text"
                                    {...register("ctaText")}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.ctaText ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., SHOP NOW"
                                />
                                {errors.ctaText && (
                                    <p className="text-red-500 text-sm mt-1">{errors.ctaText.message}</p>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Link
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
                                        placeholder="/custom-link"
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
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Layout Settings */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Layout Settings</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Height
                                </label>
                                <div className="space-y-2">
                                    {["full", "large", "medium"].map((h) => (
                                        <label key={h} className="flex items-center">
                                            <input
                                                type="radio"
                                                value={h}
                                                {...register("height")}
                                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 capitalize">{h}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
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

                    {/* Danger Zone */}
                    <div className="bg-white shadow-sm rounded-lg p-6 border border-red-200">
                        <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
                        <button
                            type="button"
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Section
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
