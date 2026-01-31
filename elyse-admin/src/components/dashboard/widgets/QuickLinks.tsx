import Link from "next/link";
import {
    Package,
    Users,
    ShoppingCart,
    FileText,
    Image,
    Settings,
    BarChart3,
    Grid,
} from "lucide-react";

interface QuickLink {
    label: string;
    href: string;
    icon: typeof Package;
    color: string;
}

const quickLinks: QuickLink[] = [
    {
        label: "Products",
        href: "/products",
        icon: Package,
        color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    },
    {
        label: "Orders",
        href: "/orders",
        icon: ShoppingCart,
        color: "bg-green-50 text-green-600 hover:bg-green-100",
    },
    {
        label: "Customers",
        href: "/customers",
        icon: Users,
        color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
    {
        label: "Categories",
        href: "/categories",
        icon: Grid,
        color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    },
    {
        label: "Landing Page",
        href: "/landing-page",
        icon: FileText,
        color: "bg-pink-50 text-pink-600 hover:bg-pink-100",
    },
    {
        label: "Media Library",
        href: "/media-library",
        icon: Image,
        color: "bg-teal-50 text-teal-600 hover:bg-teal-100",
    },
    {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
    },
    {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        color: "bg-gray-50 text-gray-600 hover:bg-gray-100",
    },
];

export default function QuickLinks() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>

            {/* Links Grid */}
            <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${link.color}`}
                        >
                            <Icon className="h-6 w-6 mb-2" />
                            <span className="text-xs font-medium text-center">
                                {link.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
