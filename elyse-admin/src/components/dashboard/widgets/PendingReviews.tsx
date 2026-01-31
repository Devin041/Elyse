import { Star } from "lucide-react";
import type { PendingReview } from "@/types/dashboard";
import { formatDistanceToNow } from "date-fns";

interface PendingReviewsProps {
    reviews: PendingReview[];
    loading?: boolean;
}

export default function PendingReviews({ reviews, loading = false }: PendingReviewsProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-3 w-3 ${i < rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pending Reviews</h3>
                {reviews.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {reviews.length} pending
                    </span>
                )}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                        {/* Product & Rating */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {review.productName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    by {review.customerName}
                                </p>
                            </div>
                            {renderStars(review.rating)}
                        </div>

                        {/* Comment */}
                        <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                            {review.comment}
                        </p>

                        {/* Meta & Actions */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(review.createdAt), {
                                    addSuffix: true,
                                })}
                            </span>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700">
                                    Approve
                                </button>
                                <button className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {reviews.length === 0 && (
                <div className="text-center py-8 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">
                        ✓ No pending reviews
                    </p>
                </div>
            )}
        </div>
    );
}
