"use client";

import { useState } from "react";
import { ArrowLeft, Save, Plus, Eye, FileText } from "lucide-react";
import Link from "next/link";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';

// Schema for blog section configuration
const blogSectionSchema = z.object({
    sectionTitle: z.string().min(1, "Section title is required"),
    showOnHomepage: z.boolean(),
    maxPostsToShow: z.number().min(1).max(10),
    isEnabled: z.boolean(),
});

type BlogSectionFormData = z.infer<typeof blogSectionSchema>;

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    featuredImageUrl: string;
    publishedAt: string;
    isFeaturedHomepage: boolean;
    isPublished: boolean;
}

import { useEffect } from "react";

interface BlogPost {
    id: string | number;
    title: string;
    excerpt: string;
    featured_image?: string;
    image_url?: string;
    published_at: string;
    is_featured: boolean;
    is_published: boolean;
}

export default function BlogSectionPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
    } = useForm<BlogSectionFormData>({
        resolver: zodResolver(blogSectionSchema),
        defaultValues: {
            sectionTitle: "Good Reads",
            showOnHomepage: true,
            maxPostsToShow: 3,
            isEnabled: true,
        },
    });

    const [selectedPosts, setSelectedPosts] = useState<(string | number)[]>([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/blog/posts');
            if (!res.ok) throw new Error("Failed to fetch posts");
            const data = await res.json();
            setPosts(data);

            // Auto-select featured posts
            const featuredIds = data
                .filter((p: BlogPost) => p.is_featured)
                .map((p: BlogPost) => p.id);
            setSelectedPosts(featuredIds);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load blog posts");
        } finally {
            setIsLoadingPosts(false);
        }
    };

    // Watch values for preview
    const sectionTitle = watch("sectionTitle");
    const maxPostsToShow = watch("maxPostsToShow");

    const onSubmit = async (data: BlogSectionFormData) => {
        try {
            // Update the homepage selection status for posts
            const payload = {
                ...data,
                selectedPostIds: selectedPosts
            };

            const res = await fetch('/api/landing-page/blog-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to save config");

            toast.success("Blog section configuration saved!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save changes. Please try again.");
        }
    };

    const togglePostSelection = (postId: string | number) => {
        setSelectedPosts(prev => {
            if (prev.includes(postId)) {
                return prev.filter(id => id !== postId);
            } else {
                if (prev.length >= maxPostsToShow) {
                    toast.error(`Maximum ${maxPostsToShow} posts allowed`);
                    return prev;
                }
                return [...prev, postId];
            }
        });
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
                        Back
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Blog Section (Good Reads)</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Configure which blog posts appear on your homepage
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/landing-page/blog/new"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Post
                    </Link>
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
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Section Settings */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Section Settings</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("sectionTitle")}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.sectionTitle ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., Good Reads"
                                />
                                {errors.sectionTitle && (
                                    <p className="text-red-500 text-sm mt-1">{errors.sectionTitle.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Maximum Posts to Show
                                </label>
                                <select
                                    {...register("maxPostsToShow", { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {[2, 3, 4, 6].map(n => (
                                        <option key={n} value={n}>{n} Posts</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Number of blog posts to display in the homepage section
                                </p>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    {...register("showOnHomepage")}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Show on Homepage
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Featured Posts Selection */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Posts to Feature</h2>

                        <div className="space-y-3">
                            {isLoadingPosts ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="text-sm text-gray-500 mt-2">Loading posts...</p>
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-8 border border-dashed rounded-lg">
                                    <p className="text-sm text-gray-500">No blog posts found.</p>
                                </div>
                            ) : posts.map((post) => (
                                <label
                                    key={post.id}
                                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${selectedPosts.includes(post.id)
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPosts.includes(post.id)}
                                        onChange={() => togglePostSelection(post.id)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <img
                                        src={post.featured_image || post.image_url || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400"}
                                        alt={post.title}
                                        className="ml-3 h-16 w-16 rounded object-cover"
                                    />
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {post.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Published: {new Date(post.published_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {post.is_featured && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Featured
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>

                        <p className="text-sm text-gray-600 mt-4">
                            {selectedPosts.length} of {maxPostsToShow} posts selected
                        </p>
                    </div>

                    {/* Preview */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Homepage Preview</h2>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">{sectionTitle}</h3>

                            <div className={`grid gap-6 ${maxPostsToShow === 2 ? 'grid-cols-2' : maxPostsToShow === 3 ? 'grid-cols-3' : maxPostsToShow === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                {posts
                                    .filter(post => selectedPosts.includes(post.id))
                                    .slice(0, maxPostsToShow)
                                    .map((post) => (
                                        <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <img
                                                src={post.featured_image || post.image_url || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400"}
                                                alt={post.title}
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="p-4">
                                                <h4 className="font-semibold text-gray-900 line-clamp-2">
                                                    {post.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                                                    {post.excerpt}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-3">
                                                    {new Date(post.published_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            {selectedPosts.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No posts selected yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
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

                    {/* Quick Actions */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>

                        <div className="space-y-2">
                            <Link
                                href="/landing-page/blog/new"
                                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Post
                            </Link>
                            <button
                                type="button"
                                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View All Posts
                            </button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Tip</h3>
                        <p className="text-xs text-blue-700">
                            Select engaging blog posts with eye-catching featured images to attract more visitors. Only published posts can be featured on the homepage.
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}
