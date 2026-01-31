"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KPICard from "@/components/dashboard/KPICard";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentOrdersTable from "@/components/dashboard/RecentOrdersTable";
import TopProductsCard from "@/components/dashboard/TopProductsCard";
import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import InventoryAlerts from "@/components/dashboard/widgets/InventoryAlerts";
import QuickLinks from "@/components/dashboard/widgets/QuickLinks";
import PendingReviews from "@/components/dashboard/widgets/PendingReviews";
import type {
    DashboardStats,
    SalesDataPoint,
    RecentOrder,
    TopProduct,
    Activity,
    LowStockAlert,
    PendingReview,
} from "@/types/dashboard";
import {
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
    const [orders, setOrders] = useState<RecentOrder[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
    const [reviews, setReviews] = useState<PendingReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        async function loadDashboardData() {
            try {
                setLoading(true);
                setError(null);

                // Fetch data from APIs - handle failures gracefully
                const fetchJson = async (url: string, fallback: any) => {
                    try {
                        const res = await fetch(url);
                        if (!res.ok) return fallback;
                        const data = await res.json();
                        return data.error ? fallback : data;
                    } catch {
                        return fallback;
                    }
                };

                const [statsData, salesDataRaw, ordersData, productsData, alertsData] = await Promise.all([
                    fetchJson('/api/dashboard/stats', { totalSales: 0, totalOrders: 0, totalCustomers: 0, salesGrowth: 0 }),
                    fetchJson('/api/dashboard/sales-chart', []),
                    fetchJson('/api/dashboard/recent-orders', []),
                    fetchJson('/api/dashboard/top-products', []),
                    fetchJson('/api/dashboard/inventory-alerts', []),
                ]);

                // Set state with fetched data
                setStats(statsData);
                setSalesData(salesDataRaw);
                setOrders(ordersData);
                setTopProducts(productsData);
                setAlerts(alertsData);

                // Mock activities and reviews (no APIs yet)
                setActivities([]);
                setReviews([]);
            } catch (err: any) {
                console.error('Dashboard data error:', err);
                // Use fallback data instead of showing error
                setStats({ totalSales: 0, totalOrders: 0, totalCustomers: 0, salesGrowth: 0 });
                setSalesData([]);
                setOrders([]);
                setTopProducts([]);
                setAlerts([]);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);


    // Note: We use fallback data instead of showing errors

    return (
        <div className="space-y-6">
            {/* Header */}
            <DashboardHeader />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <KPICard
                    title="Total Sales"
                    value={stats ? `₹${stats.totalSales.toLocaleString()}` : "Loading..."}
                    change={stats?.salesGrowth || 0}
                    trend={stats && stats.salesGrowth >= 0 ? "up" : "down"}
                    icon={DollarSign}
                    color="green"
                    subtitle="all time"
                    loading={loading}
                />

                <KPICard
                    title="Total Orders"
                    value={stats?.totalOrders || 0}
                    change={0}
                    trend="up"
                    icon={ShoppingCart}
                    color="blue"
                    subtitle="all time"
                    loading={loading}
                />

                <KPICard
                    title="Total Customers"
                    value={stats?.totalCustomers || 0}
                    change={0}
                    trend="up"
                    icon={Users}
                    color="purple"
                    subtitle="registered"
                    loading={loading}
                />

                <KPICard
                    title="Low Stock Items"
                    value={alerts.length}
                    change={0}
                    trend={alerts.length > 5 ? "down" : "up"}
                    icon={Package}
                    color="orange"
                    subtitle="requires attention"
                    loading={loading}
                />

                <KPICard
                    title="Avg Order Value"
                    value={
                        stats?.totalOrders && stats.totalSales > 0
                            ? `₹${Math.round(stats.totalSales / stats.totalOrders).toLocaleString()}`
                            : "₹0"
                    }
                    change={0}
                    trend="up"
                    icon={TrendingUp}
                    color="teal"
                    subtitle="per order"
                    loading={loading}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Charts & Tables */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Sales Chart */}
                    <SalesChart data={salesData} loading={loading} />

                    {/* Recent Orders */}
                    <RecentOrdersTable orders={orders} loading={loading} />

                    {/* Top Products */}
                    <TopProductsCard products={topProducts} loading={loading} />
                </div>

                {/* Right Column - Widgets */}
                <div className="space-y-6">
                    {/* Quick Links */}
                    <QuickLinks />

                    {/* Activity Feed */}
                    <ActivityFeed activities={activities} loading={loading} />

                    {/* Inventory Alerts */}
                    <InventoryAlerts alerts={alerts} loading={loading} />

                    {/* Pending Reviews */}
                    <PendingReviews reviews={reviews} loading={loading} />
                </div>
            </div>
        </div>
    );
}
