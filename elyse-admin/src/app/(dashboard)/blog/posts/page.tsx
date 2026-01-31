"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Star, Eye, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image_url: string;
    author: {
        name: string;
        email: string;
    };
    is_published: boolean;
    is_featured: boolean;
    published_at: string;
    created_at: string;
}

export default function BlogPostsListPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

    useEffect(() => {
        fetchPosts();
    }, [statusFilter]);

    const fetchPosts = async () => {
        try {
            let url = "/api/blog/posts";
            const params = new URLSearchParams();

            if (statusFilter !== "all") {
                params.append("status", statusFilter);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch posts");

            const data = await res.json();
            setPosts(data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load blog posts");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const res = await fetch(`/api/blog/posts/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete post");

            toast.success("Post deleted successfully");
            fetchPosts();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete post");
        }
    };

    const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/blog/posts/${id}/feature`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_featured: !currentStatus }),
            });

            if (!res.ok) throw new Error("Failed to update featured status");

            toast.success(currentStatus ? "Removed from featured" : "Added to featured");
            fetchPosts();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update featured status");
        }
    };

    const filteredPosts = posts.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Blog Posts</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your blog content and articles
                    </p>
                </div>
                <Link
                    href="/landing-page/blog/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStatusFilter("all")}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${statusFilter === "all"
                                    ? "bg-black text-white"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter("published")}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${statusFilter === "published"
                                    ? "bg-black text-white"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            Published
                        </button>
                        <button
                            onClick={() => setStatusFilter("draft")}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${statusFilter === "draft"
                                    ? "bg-black text-white"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            Drafts
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Post
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Author
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Published
                            </th>
                            <th className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPosts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <p className="text-gray-500">No blog posts found</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Create your first post to get started
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            filteredPosts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {post.featured_image_url && (
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded object-cover"
                                                        src={post.featured_image_url}
                                                        alt=""
                                                    />
                                                </div>
                                            )}
                                            <div className={post.featured_image_url ? "ml-4" : ""}>
                                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                                    {post.title}
                                                    {post.is_featured && (
                                                        <Star className="h-4 w-4 ml-2 text-yellow-400 fill-current" />
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 line-clamp-1">
                                                    {post.excerpt}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{post.author.name}</div>
                                        <div className="text-sm text-gray-500">{post.author.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.is_published
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {post.is_published ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {post.published_at
                                            ? new Date(post.published_at).toLocaleDateString()
                                            : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleToggleFeatured(post.id, post.is_featured)}
                                            className="text-yellow-600 hover:text-yellow-900 mr-4"
                                            title={post.is_featured ? "Remove from featured" : "Add to featured"}
                                        >
                                            <Star
                                                className={`h-4 w-4 inline ${post.is_featured ? "fill-current" : ""
                                                    }`}
                                            />
                                        </button>
                                        <Link
                                            href={`/landing-page/blog/${post.id}`}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4 inline" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
