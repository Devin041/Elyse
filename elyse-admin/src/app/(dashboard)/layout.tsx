"use client";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Folder, Mail, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from 'react-hot-toast';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { logout, user, loading } = useAuth();
    const pathname = usePathname();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!loading && !user) {
        // Redirect to login if user is not authenticated
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        return null;
    }

    if (!user) return null;

    const navigation = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Landing Page", href: "/landing-page", icon: LayoutDashboard },
        { name: "Products", href: "/products", icon: Package },
        { name: "Categories", href: "/categories", icon: Folder },
        { name: "Collections", href: "/collections", icon: Layers },
        { name: "Orders", href: "/orders", icon: ShoppingBag },
        { name: "Customers", href: "/customers", icon: Users },
        { name: "Inquiries", href: "/inquiries", icon: Mail },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <h1 className="text-xl font-bold">Elyse Admin</h1>
                        </div>
                        <nav className="mt-8 flex-1 px-2 space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            isActive
                                                ? "bg-gray-100 text-gray-900"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                            "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                isActive
                                                    ? "text-gray-500"
                                                    : "text-gray-400 group-hover:text-gray-500",
                                                "mr-3 flex-shrink-0 h-6 w-6"
                                            )}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <div className="flex-shrink-0 w-full group block">
                            <div className="flex items-center">
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-700">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-xs font-medium text-gray-500">
                                        {user.email}
                                    </p>
                                    <button
                                        onClick={logout}
                                        className="mt-2 flex items-center text-xs text-red-600 hover:text-red-800"
                                    >
                                        <LogOut className="mr-1 h-3 w-3" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="md:pl-64 flex flex-col flex-1">
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
            {/* Toaster is already in RootLayout */}
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <DashboardContent>{children}</DashboardContent>
        </AuthProvider>
    );
}
