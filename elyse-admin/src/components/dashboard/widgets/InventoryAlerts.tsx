import { AlertTriangle } from "lucide-react";
import type { LowStockAlert } from "@/types/dashboard";
import Link from "next/link";

interface InventoryAlertsProps {
    alerts: LowStockAlert[];
    loading?: boolean;
}

export default function InventoryAlerts({ alerts, loading = false }: InventoryAlertsProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
                {alerts.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {alerts.length} alerts
                    </span>
                )}
            </div>

            {/* Alerts List */}
            <div className="space-y-3">
                {alerts.map((alert) => (
                    <div
                        key={alert.productId}
                        className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                        {/* Product Image */}
                        <img
                            src={alert.image}
                            alt={alert.productName}
                            className="h-12 w-12 rounded object-cover flex-shrink-0"
                        />

                        {/* Alert Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {alert.productName}
                                    </p>
                                    <p className="text-xs text-red-600 mt-1 flex items-center">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Only {alert.currentStock} left (min: {alert.minStock})
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <Link
                            href={`/products/${alert.productId}`}
                            className="flex-shrink-0 text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Restock
                        </Link>
                    </div>
                ))}
            </div>

            {alerts.length === 0 && (
                <div className="text-center py-8 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">✓ All products are well stocked</p>
                </div>
            )}
        </div>
    );
}
