"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye, Upload, X } from "lucide-react";
import Link from "next/link";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { brandStorySchema } from '@/lib/validations/landingPage';
import { toast } from 'react-hot-toast';
import type { z } from 'zod';

type BrandStoryFormData = z.infer<typeof brandStorySchema>;

export default function BrandStoryPage() {
    const [isLoading, setIsLoading] = useState(true);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
        reset,
    } = useForm<BrandStoryFormData>({
        resolver: zodResolver(brandStorySchema),
        defaultValues: {
            heading: "",
            subheading: "",
            description: "",
            backgroundImageUrl: "",
            textColor: "#FFFFFF",
            backgroundColor: "#1F2937",
            alignment: "center",
            isEnabled: true
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/landing-page/brand-story');
                if (!res.ok) throw new Error('Failed to fetch brand story');
                const data = await res.json();

                if (data) {
                    reset({
                        heading: data.title,
                        subheading: data.config?.subheading || "",
                        description: data.content,
                        backgroundImageUrl: data.image_url,
                        isEnabled: data.is_enabled,
                        // Config fields
                        textColor: data.config?.textColor || "#FFFFFF",
                        backgroundColor: data.config?.backgroundColor || "#1F2937",
                        alignment: data.config?.alignment || "center",
                    });
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load brand story");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [reset]);

    // Watch values for preview
    const formData = watch();

    const onSubmit = async (data: BrandStoryFormData) => {
        try {
            const payload = {
                title: data.heading,
                content: data.description,
                image_url: data.backgroundImageUrl,
                is_enabled: data.isEnabled,
                config: {
                    subheading: data.subheading,
                    textColor: data.textColor,
                    backgroundColor: data.backgroundColor,
                    alignment: data.alignment
                }
            };

            const res = await fetch('/api/landing-page/brand-story', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to update brand story');

            toast.success("Brand story saved successfully!");
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
                            Brand Story Section
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Share your brand's story with customers
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
                                    Heading <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("heading")}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.heading ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., Our Story"
                                />
                                {errors.heading && (
                                    <p className="text-red-500 text-sm mt-1">{errors.heading.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subheading
                                </label>
                                <input
                                    type="text"
                                    {...register("subheading")}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.subheading ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., Crafted with Love"
                                />
                                {errors.subheading && (
                                    <p className="text-red-500 text-sm mt-1">{errors.subheading.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    {...register("description")}
                                    rows={10}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Tell your brand's story..."
                                />
                                <div className="flex justify-between mt-1">
                                    {errors.description ? (
                                        <p className="text-red-500 text-sm">{errors.description.message}</p>
                                    ) : (
                                        <span></span>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        {formData.description?.length || 0} characters
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Background</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Background Image
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    {formData.backgroundImageUrl ? (
                                        <div className="relative">
                                            <img
                                                src={formData.backgroundImageUrl || ""}
                                                alt="Background"
                                                className="max-h-48 mx-auto rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setValue("backgroundImageUrl", "")}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-600">Upload background image</p>
                                            <p className="text-xs text-gray-500 mt-1">Recommended: 1920×1080px</p>
                                            <button
                                                type="button"
                                                className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                Choose from Media Library
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Background Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            {...register("backgroundColor")}
                                            className="h-10 w-16 rounded border border-gray-300"
                                        />
                                        <input
                                            type="text"
                                            {...register("backgroundColor")}
                                            className={`flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.backgroundColor ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                    </div>
                                    {errors.backgroundColor && (
                                        <p className="text-red-500 text-sm mt-1">{errors.backgroundColor.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Text Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            {...register("textColor")}
                                            className="h-10 w-16 rounded border border-gray-300"
                                        />
                                        <input
                                            type="text"
                                            {...register("textColor")}
                                            className={`flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.textColor ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                    </div>
                                    {errors.textColor && (
                                        <p className="text-red-500 text-sm mt-1">{errors.textColor.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>

                        <div
                            className="rounded-lg p-8 min-h-[300px] flex flex-col justify-center relative overflow-hidden"
                            style={{
                                backgroundColor: formData.backgroundColor,
                                color: formData.textColor,
                                textAlign: formData.alignment,
                            }}
                        >
                            {formData.backgroundImageUrl && (
                                <>
                                    <div
                                        className="absolute inset-0 z-0"
                                        style={{
                                            backgroundImage: `url(${formData.backgroundImageUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div>
                                </>
                            )}
                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold mb-2">{formData.heading || "Heading"}</h2>
                                <p className="text-xl mb-4">{formData.subheading || "Subheading"}</p>
                                <p className="text-base whitespace-pre-wrap">{formData.description || "Description will appear here..."}</p>
                            </div>
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
                                    Text Alignment
                                </label>
                                <div className="space-y-2">
                                    {['left', 'center', 'right'].map((align) => (
                                        <label key={align} className="flex items-center">
                                            <input
                                                type="radio"
                                                value={align}
                                                {...register("alignment")}
                                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 capitalize">{align}</span>
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
                </div>
            </div>
        </form>
    );
}
