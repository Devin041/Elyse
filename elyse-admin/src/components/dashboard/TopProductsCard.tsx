import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { TopProduct } from "@/types/dashboard";
import Link from "next/link";

interface TopProductsCardProps {
    products: TopProduct[];
    loading?: boolean;
}

export default function TopProductsCard({ products, loading = false }: TopProductsCardProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="h-16 w-16 bg-gray-200 rounded"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const getTrendIcon = (trend: TopProduct['trend']) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-600" />;
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-600" />;
            default:
                return <Minus className="h-4 w-4 text-gray-400" />;
        }
    };

    const getTrendColor = (trend: TopProduct['trend']) => {
        switch (trend) {
            case 'up':
                return 'text-green-600';
            case 'down':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
                <Link
                    href="/products"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    View All →
                </Link>
            </div>

            {/* Products List */}
            <div className="space-y-4">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {/* Rank */}
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                            <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                        </div>

                        {/* Product Image */}
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                        />

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                            <Link
                                href={`/products/${product.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
                            >
                                {product.name}
                            </Link>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500">
                                    {product.unitsSold || 0} sold
                                </span>
                                <span className="text-xs font-medium text-gray-900">
                                    ₹{(product.revenue || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Stock & Trend */}
                        <div className="flex flex-col items-end gap-1">
                            <div className={`flex items-center gap-1 ${getTrendColor(product.trend)}`}>
                                {getTrendIcon(product.trend)}
                            </div>
                            <span className={`text-xs font-medium ${(product.stock || 0) < 10 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                {product.stock || 0} in stock
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No products data available</p>
                </div>
            )}
        </div>
    );
}
