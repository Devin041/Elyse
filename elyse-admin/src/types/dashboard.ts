// Dashboard Type Definitions

export interface DashboardStats {
    revenue: RevenueStats;
    orders: OrderStats;
    customers: CustomerStats;
    inventory: InventoryStats;
    aov: AOVStats;
}

export interface RevenueStats {
    today: number;
    thisMonth: number;
    growth: number;
    comparison: number;
}

export interface OrderStats {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
    todayCount: number;
}

export interface CustomerStats {
    total: number;
    new: number;
    active: number;
    weeklyGrowth: number;
}

export interface InventoryStats {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
}

export interface AOVStats {
    current: number;
    growth: number;
    comparison: number;
}

export interface SalesDataPoint {
    date: string;
    revenue: number;
    orders: number;
}

export interface RecentOrder {
    id: string;
    customerName: string;
    createdAt: string;
    total: number;
    paymentStatus: 'paid' | 'pending' | 'failed';
    orderStatus: 'pending' | 'processing' | 'completed' | 'cancelled' | 'shipped';
    items: number;
}

export interface TopProduct {
    id: number;
    name: string;
    image: string;
    unitsSold: number;
    revenue: number;
    stock: number;
    trend: 'up' | 'down' | 'stable';
}

export type ActivityType =
    | 'order_placed'
    | 'customer_registered'
    | 'product_updated'
    | 'payment_received'
    | 'review_posted'
    | 'inventory_updated';

export interface Activity {
    id: string;
    type: ActivityType;
    message: string;
    timestamp: Date;
    relatedId?: string;
}

export interface LowStockAlert {
    productId: number;
    productName: string;
    currentStock: number;
    minStock: number;
    image: string;
}

export interface PendingReview {
    id: number;
    productId: number;
    productName: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: string;
}
