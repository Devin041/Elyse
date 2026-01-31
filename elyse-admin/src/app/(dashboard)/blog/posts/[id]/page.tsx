"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Loader2, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const blogPostSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    excerpt: z.string().min(1, "Excerpt is required"),
    content: z.string().min(1, "Content is required"),
    featured_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    is_published: z.boolean(),
    is_featured: z.boolean(),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

export default function BlogPostEditPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.id as string | undefined;
    const isNewPost = postId === "new";

    const [loading, setLoading] = useState(!isNewPost);
    const [saving, setSaving] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
    } = useForm<BlogPostFormData>({
        resolver: zodResolver(blogPostSchema),
        defaultValues: {
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            featured_image_url: "",
            is_published: false,
            is_featured: false,
        },
    });

    useEffect(() => {
        if (!isNewPost && postId) {
            fetchPost();
        }
    }, [postId, isNewPost]);

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/blog/posts/${postId}`);
            if (!res.ok) throw new Error("Failed to fetch post");

            const data = await res.json();
            const post = data.data;

            reset({
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                content: post.content,
                featured_image_url: post.featured_image_url || "",
                is_published: post.is_published,
                is_featured: post.is_featured,
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load post");
            router.push("/blog/posts");
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setValue("title", title);
        if (isNewPost) {
            setValue("slug", generateSlug(title));
        }
    };

    const onSubmit = async (data: BlogPostFormData) => {
        setSaving(true);

        try {
            const url = isNewPost ? "/api/blog/posts" : `/api/blog/posts/${postId}`;
            const method = isNewPost ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to save post");

            toast.success(isNewPost ? "Post created successfully" : "Post updated successfully");
            router.push("/blog/posts");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save post");
        } finally {
            setSaving(false);
        }
    };

    const title = watch("title");
    const excerpt = watch("excerpt");
    const content = watch("content");
    const featuredImageUrl = watch("featured_image_url");

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/blog/posts"
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Posts
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {isNewPost ? "Create New Post" : "Edit Post"}
                        </h1>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Post"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Post Details */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Post Details</h2>

                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("title")}
                                    onChange={handleTitleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black ${errors.title ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="e.g., How to Style Your Festive Lehenga"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("slug")}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black ${errors.slug ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="auto-generated-from-title"
                                />
                                {errors.slug && (
                                    <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    URL-friendly version of the title
                                </p>
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Excerpt <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    {...register("excerpt")}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black ${errors.excerpt ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="Brief summary of the post..."
                                />
                                {errors.excerpt && (
                                    <p className="text-red-500 text-sm mt-1">{errors.excerpt.message}</p>
                                )}
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Content <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    {...register("content")}
                                    rows={15}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black font-mono text-sm ${errors.content ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="Write your post content here... (Markdown supported)"
                                />
                                {errors.content && (
                                    <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    You can use Markdown formatting
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="text"
                                    {...register("featured_image_url")}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black ${errors.featured_image_url ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="https://example.com/image.jpg"
                                />
                                {errors.featured_image_url && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.featured_image_url.message}
                                    </p>
                                )}
                            </div>

                            {featuredImageUrl && (
                                <div className="relative">
                                    <img
                                        src={featuredImageUrl}
                                        alt="Featured"
                                        className="w-full h-64 object-cover rounded-lg"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>

                        <div className="prose max-w-none">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {title || "Post Title"}
                            </h1>
                            <p className="text-gray-600 mb-4">{excerpt || "Post excerpt..."}</p>
                            {featuredImageUrl && (
                                <img
                                    src={featuredImageUrl}
                                    alt="Featured"
                                    className="w-full h-64 object-cover rounded-lg mb-4"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            )}
                            <div className="whitespace-pre-wrap">{content || "Post content..."}</div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Publish Settings */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Publish Settings</h2>

                        <div className="space-y-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    {...register("is_published")}
                                    className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700">
                                    Publish this post
                                </span>
                            </label>
                            <p className="text-xs text-gray-500">
                                Unpublished posts are saved as drafts
                            </p>

                            <div className="border-t border-gray-200 pt-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        {...register("is_featured")}
                                        className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        Feature on homepage
                                    </span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                    Featured posts appear in the blog section
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">💡 SEO Tips</h3>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Keep title under 60 characters</li>
                            <li>• Excerpt should be 155-160 characters</li>
                            <li>• Use descriptive slugs with keywords</li>
                            <li>• Add high-quality featured image</li>
                        </ul>
                    </div>
                </div>
            </div>
        </form>
    );
}
