import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down';
    icon: LucideIcon;
    color: 'green' | 'blue' | 'purple' | 'orange' | 'teal';
    subtitle?: string;
    loading?: boolean;
}

const colorClasses = {
    green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: 'bg-green-100',
    },
    blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'bg-blue-100',
    },
    purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'bg-purple-100',
    },
    orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        icon: 'bg-orange-100',
    },
    teal: {
        bg: 'bg-teal-50',
        text: 'text-teal-600',
        icon: 'bg-teal-100',
    },
};

export default function KPICard({
    title,
    value,
    change,
    trend,
    icon: Icon,
    color,
    subtitle,
    loading = false,
}: KPICardProps) {
    const colors = colorClasses[color];
    const isPositive = change >= 0;

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
        );
    }

    return (
        <div className={`${colors.bg} rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <div className={`${colors.icon} p-2 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
            </div>

            {/* Main Value */}
            <div className="mb-2">
                <h3 className={`text-3xl font-bold ${colors.text}`}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
            </div>

            {/* Change Indicator */}
            <div className="flex items-center justify-between">
                <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span>
                        {isPositive ? '+' : ''}{change}%
                    </span>
                </div>
                {subtitle && (
                    <span className="text-xs text-gray-500">{subtitle}</span>
                )}
            </div>
        </div>
    );
}
