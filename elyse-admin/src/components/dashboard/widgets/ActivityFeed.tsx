import { Package, UserPlus, ShoppingBag, DollarSign, Star, Archive } from "lucide-react";
import type { Activity, ActivityType } from "@/types/dashboard";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
    activities: Activity[];
    loading?: boolean;
}

const activityConfig: Record<ActivityType, { icon: typeof Package; color: string }> = {
    order_placed: { icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
    customer_registered: { icon: UserPlus, color: "text-green-600 bg-green-50" },
    product_updated: { icon: Archive, color: "text-purple-600 bg-purple-50" },
    payment_received: { icon: DollarSign, color: "text-green-600 bg-green-50" },
    review_posted: { icon: Star, color: "text-yellow-600 bg-yellow-50" },
    inventory_updated: { icon: Package, color: "text-orange-600 bg-orange-50" },
};

export default function ActivityFeed({ activities, loading = false }: ActivityFeedProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View All
                </button>
            </div>

            {/* Activity List */}
            <div className="space-y-4">
                {activities.map((activity) => {
                    const config = activityConfig[activity.type];
                    const Icon = config.icon;

                    return (
                        <div key={activity.id} className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={`flex-shrink-0 p-2 rounded-full ${config.color}`}>
                                <Icon className="h-4 w-4" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">{activity.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {activities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No recent activity</p>
                </div>
            )}
        </div>
    );
}
