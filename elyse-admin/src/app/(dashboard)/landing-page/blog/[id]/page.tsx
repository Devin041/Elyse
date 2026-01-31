"use client";

import { useState } from "react";
import { ArrowLeft, Save, Eye, Trash2, Upload, Calendar, User } from "lucide-react";
import Link from "next/link";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { blogPostSchema } from '@/lib/validations/landingPage';
import { toast } from 'react-hot-toast';
import type { z } from 'zod';
import ImageUploader from "@/components/ImageUploader";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

type BlogPostFormData = z.infer<typeof blogPostSchema>;

export default function BlogPostEditPage({ params: rawParams }: { params: Promise<{ id?: string }> }) {
    const params = React.use(rawParams);
    const postId = params.id as string | undefined;
    const isNew = !postId || postId === "new";

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(!isNew);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
        reset,
    } = useForm<BlogPostFormData>({
        resolver: zodResolver(blogPostSchema),
        defaultValues: {
            slug: "",
            title: "",
            excerpt: "",
            content: "",
            featuredImageUrl: "",
            authorName: "Elyse Team",
            isPublished: false,
            isFeaturedHomepage: false,
            metaTitle: "",
            metaDescription: ""
        },
    });

    useEffect(() => {
        if (!isNew && postId) {
            fetchPost();
        }
    }, [postId, isNew]);

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/blog/posts/${postId}`);
            if (!res.ok) throw new Error("Failed to fetch post");

            const post = await res.json();

            reset({
                title: post.title || "",
                slug: post.slug || "",
                excerpt: post.excerpt || "",
                content: post.content || "",
                featuredImageUrl: post.featured_image || "",
                authorName: post.author_name || "Elyse Team",
                isPublished: post.is_published || false,
                isFeaturedHomepage: post.is_featured || false,
                metaTitle: post.meta_title || post.title || "",
                metaDescription: post.meta_description || post.excerpt || ""
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load post");
            router.push("/landing-page/blog");
        } finally {
            setIsLoading(false);
        }
    };

    // Watch values for preview and slug generation
    const title = watch("title");
    const slug = watch("slug");
    const excerpt = watch("excerpt");
    const content = watch("content");
    const featuredImageUrl = watch("featuredImageUrl");
    const metaTitle = watch("metaTitle");
    const metaDescription = watch("metaDescription");
    const isPublished = watch("isPublished");

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setValue("title", newTitle);
        if (isNew) {
            setValue("slug", generateSlug(newTitle));
            setValue("metaTitle", newTitle);
        }
    };

    const onSubmit = async (data: BlogPostFormData) => {
        try {
            const url = isNew ? "/api/blog/posts" : `/api/blog/posts/${postId}`;
            const method = isNew ? "POST" : "PUT";

            const payload = {
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                content: data.content,
                featured_image: data.featuredImageUrl, // Mapping to db column
                author_name: data.authorName,
                is_published: data.isPublished,
                is_featured: data.isFeaturedHomepage,
                meta_title: data.metaTitle,
                meta_description: data.metaDescription,
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || errorData.error || "Failed to save post");
            }

            toast.success(isNew ? "Post created successfully" : "Post updated successfully");
            router.push("/landing-page/blog");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save post");
        }
    };

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
                </div>
                <div className="flex gap-3">
                    <button type="button" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={() => setValue("isPublished", false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={() => setValue("isPublished", true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "Publishing..." : "Publish"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("title")}
                                    onChange={handleTitleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg font-medium ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., How to Style Your Festive Lehenga"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug
                                </label>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-500 mr-2">/blog/</span>
                                    <input
                                        type="text"
                                        {...register("slug")}
                                        className={`flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${errors.slug ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="how-to-style-festive-lehenga"
                                    />
                                </div>
                                {errors.slug && (
                                    <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Excerpt
                                </label>
                                <textarea
                                    {...register("excerpt")}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.excerpt ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="A brief summary of your blog post (shown in previews)"
                                />
                                <div className="flex justify-between mt-1">
                                    {errors.excerpt && (
                                        <p className="text-red-500 text-xs">{errors.excerpt.message}</p>
                                    )}
                                    <p className="text-xs text-gray-500 ml-auto">
                                        {excerpt?.length || 0}/160 characters
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Featured Image</h3>
                        <ImageUploader
                            onImagesUploaded={(urls) => setValue("featuredImageUrl", urls[0])}
                            maxImages={1}
                            initialImages={featuredImageUrl ? [featuredImageUrl] : []}
                        />
                    </div>

                    {/* Content Editor */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Content</h3>

                        {/* Simple Toolbar */}
                        <div className="border border-gray-300 rounded-t-md p-2 flex gap-1 bg-gray-50">
                            {["Bold", "Italic", "H1", "H2", "H3", "List", "Link", "Image"].map((btn) => (
                                <button
                                    key={btn}
                                    type="button"
                                    className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded"
                                >
                                    {btn}
                                </button>
                            ))}
                        </div>

                        <textarea
                            {...register("content")}
                            rows={20}
                            className={`w-full px-3 py-2 border border-t-0 rounded-b-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${errors.content ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Write your blog content here... (Markdown supported)"
                        />
                        {errors.content && (
                            <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            📝 Tip: You can use Markdown formatting
                        </p>
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    {...register("metaTitle")}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.metaTitle ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="SEO-optimized title (60 characters max)"
                                />
                                <div className="flex justify-between mt-1">
                                    {errors.metaTitle && (
                                        <p className="text-red-500 text-xs">{errors.metaTitle.message}</p>
                                    )}
                                    <p className="text-xs text-gray-500 ml-auto">
                                        {metaTitle?.length || 0}/60 characters
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Description
                                </label>
                                <textarea
                                    {...register("metaDescription")}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.metaDescription ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="SEO-optimized description (160 characters max)"
                                />
                                <div className="flex justify-between mt-1">
                                    {errors.metaDescription && (
                                        <p className="text-red-500 text-xs">{errors.metaDescription.message}</p>
                                    )}
                                    <p className="text-xs text-gray-500 ml-auto">
                                        {metaDescription?.length || 0}/160 characters
                                    </p>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-2">Google Search Preview:</p>
                                <div className="space-y-1">
                                    <p className="text-blue-600 text-lg font-medium">
                                        {metaTitle || title || "Blog Post Title"}
                                    </p>
                                    <p className="text-green-700 text-sm">
                                        elyse.com › blog › {slug || "post-slug"}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        {metaDescription || excerpt || "Blog post description will appear here..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Publish Settings */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Publish</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        {...register("isPublished")}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        Published
                                    </span>
                                </label>
                            </div>

                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        {...register("isFeaturedHomepage")}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        Feature on Homepage
                                    </span>
                                </label>
                                <p className="ml-6 text-xs text-gray-500 mt-1">
                                    Show in "Good Reads" section
                                </p>
                            </div>

                            {isPublished && (
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span>Published on Nov 26, 2024</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Author */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Author</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Author Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    {...register("authorName")}
                                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.authorName ? 'border-red-500' : 'border-gray-300'}`}
                                />
                            </div>
                            {errors.authorName && (
                                <p className="text-red-500 text-sm mt-1">{errors.authorName.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Categories/Tags */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>

                        <div className="space-y-2">
                            {["Style Guide", "Fashion Tips", "Product Spotlight", "Wedding Guide"].map((cat) => (
                                <label key={cat} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    {!isNew && (
                        <div className="bg-white shadow-sm rounded-lg p-6 border border-red-200">
                            <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                            <button
                                type="button"
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Post
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
