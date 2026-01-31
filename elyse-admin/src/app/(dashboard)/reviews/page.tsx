"use client";

import { useEffect, useState } from "react";
import { Star, Check, X, Loader2, Package, User } from "lucide-react";
import toast from "react-hot-toast";

interface Review {
    id: string;
    product_id: string;
    product_name: string;
    user_name: string;
    user_email: string;
    rating: number;
    comment: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
}

export default function ReviewModerationPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "all">(
        "pending"
    );
    const [productFilter, setProductFilter] = useState<string>("all");
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchReviews();
    }, [statusFilter, productFilter]);

    const fetchReviews = async () => {
        try {
            let url = "/api/reviews";
            const params = new URLSearchParams();

            if (statusFilter !== "all") {
                params.append("status", statusFilter);
            }
            if (productFilter !== "all") {
                params.append("product", productFilter);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch reviews");

            const data = await res.json();
            setReviews(data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setProcessing(id);
        try {
            const res = await fetch(`/api/reviews/${id}/approve`, {
                method: "PUT",
            });

            if (!res.ok) throw new Error("Failed to approve review");

            toast.success("Review approved");
            fetchReviews();
        } catch (error) {
            console.error(error);
            toast.error("Failed to approve review");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        setProcessing(id);
        try {
            const res = await fetch(`/api/reviews/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete review");

            toast.success("Review deleted");
            fetchReviews();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete review");
        } finally {
            setProcessing(null);
        }
    };

    const getStarRating = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
            />
        ));
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
        };
        return (
            <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
                    }`}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
        );
    }

    const stats = {
        total: reviews.length,
        pending: reviews.filter((r) => r.status === "pending").length,
        approved: reviews.filter((r) => r.status === "approved").length,
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Review Moderation</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Approve or reject customer reviews for products
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Star className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Reviews
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-2xl">⏳</span>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Pending
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Check className="h-6 w-6 text-green-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Approved
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.approved}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white shadow sm:rounded-lg mb-4">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        {["pending", "approved", "rejected", "all"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setStatusFilter(tab as any)}
                                className={`${statusFilter === tab
                                        ? "border-black text-black"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                            >
                                {tab}
                                {tab === "pending" && stats.pending > 0 && (
                                    <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                                        {stats.pending}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {reviews.length === 0 ? (
                    <div className="text-center py-12">
                        <Star className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {statusFilter === "pending"
                                ? "No pending reviews to moderate"
                                : "Change filter to see other reviews"}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {reviews.map((review) => (
                            <li key={review.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Product Info */}
                                        <div className="flex items-center mb-2">
                                            <Package className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-sm font-medium text-gray-900">
                                                {review.product_name}
                                            </span>
                                            <span className="ml-3">{getStatusBadge(review.status)}</span>
                                        </div>

                                        {/* Rating */}
                                        <div className="flex items-center mb-2">
                                            {getStarRating(review.rating)}
                                            <span className="ml-2 text-sm text-gray-600">
                                                {review.rating} out of 5
                                            </span>
                                        </div>

                                        {/* Review Comment */}
                                        <p className="text-sm text-gray-700 mb-3">{review.comment}</p>

                                        {/* Reviewer Info */}
                                        <div className="flex items-center text-sm text-gray-500">
                                            <User className="h-4 w-4 mr-1" />
                                            <span className="font-medium">{review.user_name}</span>
                                            <span className="mx-2">•</span>
                                            <span>{review.user_email}</span>
                                            <span className="mx-2">•</span>
                                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {review.status === "pending" && (
                                        <div className="ml-6 flex gap-2">
                                            <button
                                                onClick={() => handleApprove(review.id)}
                                                disabled={processing === review.id}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {processing === review.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleReject(review.id)}
                                                disabled={processing === review.id}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                {processing === review.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <X className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
