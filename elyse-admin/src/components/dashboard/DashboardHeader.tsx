import { Plus, Package, Users, FileText } from "lucide-react";
import Link from "next/link";

interface QuickAction {
    label: string;
    href: string;
    icon: typeof Plus;
}

const quickActions: QuickAction[] = [
    { label: "Add Product", href: "/products/new", icon: Plus },
    { label: "Create Order", href: "/orders/new", icon: Package },
    { label: "Add Customer", href: "/customers/new", icon: Users },
    { label: "New Blog Post", href: "/landing-page/blog/new", icon: FileText },
];

export default function DashboardHeader({ adminName = "Admin" }: { adminName?: string }) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {adminName}! 👋
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {formattedDate} • {formattedTime}
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <Icon className="h-4 w-4 mr-2" />
                                {action.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
