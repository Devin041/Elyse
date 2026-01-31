import type {
    DashboardStats,
    SalesDataPoint,
    RecentOrder,
    TopProduct,
    Activity,
    LowStockAlert,
    PendingReview
} from '@/types/dashboard';

// Mock Dashboard Statistics
export const mockDashboardStats: DashboardStats = {
    revenue: {
        today: 45000,
        thisMonth: 1245000,
        growth: 12.5,
        comparison: 1110000
    },
    orders: {
        total: 145,
        pending: 12,
        processing: 8,
        completed: 125,
        cancelled: 0,
        todayCount: 8
    },
    customers: {
        total: 1234,
        new: 23,
        active: 890,
        weeklyGrowth: 15
    },
    inventory: {
        total: 456,
        inStock: 398,
        lowStock: 12,
        outOfStock: 46
    },
    aov: {
        current: 8586,
        growth: 5.2,
        comparison: 8166
    }
};

// Mock Sales Chart Data (Last 7 Days)
export const mockSalesData: SalesDataPoint[] = [
    { date: '2024-11-21', revenue: 34000, orders: 12 },
    { date: '2024-11-22', revenue: 45000, orders: 15 },
    { date: '2024-11-23', revenue: 38000, orders: 11 },
    { date: '2024-11-24', revenue: 52000, orders: 18 },
    { date: '2024-11-25', revenue: 48000, orders: 16 },
    { date: '2024-11-26', revenue: 56000, orders: 20 },
    { date: '2024-11-27', revenue: 45000, orders: 8 },
];

// Mock Recent Orders
export const mockRecentOrders: RecentOrder[] = [
    {
        id: '1234',
        customerName: 'Priya Sharma',
        createdAt: '2024-11-27T10:30:00Z',
        total: 12999,
        paymentStatus: 'paid',
        orderStatus: 'processing',
        items: 3
    },
    {
        id: '1235',
        customerName: 'Rahul Verma',
        createdAt: '2024-11-27T09:15:00Z',
        total: 8499,
        paymentStatus: 'paid',
        orderStatus: 'shipped',
        items: 2
    },
    {
        id: '1236',
        customerName: 'Anjali Patel',
        createdAt: '2024-11-27T08:45:00Z',
        total: 15999,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        items: 4
    },
    {
        id: '1237',
        customerName: 'Vikram Singh',
        createdAt: '2024-11-26T18:20:00Z',
        total: 6999,
        paymentStatus: 'paid',
        orderStatus: 'completed',
        items: 1
    },
    {
        id: '1238',
        customerName: 'Neha Gupta',
        createdAt: '2024-11-26T16:30:00Z',
        total: 22499,
        paymentStatus: 'paid',
        orderStatus: 'processing',
        items: 5
    }
];

// Mock Top Products
export const mockTopProducts: TopProduct[] = [
    {
        id: 1,
        name: 'Red Embroidered Lehenga',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=100',
        unitsSold: 45,
        revenue: 584550,
        stock: 12,
        trend: 'up'
    },
    {
        id: 2,
        name: 'Blue Designer Gown',
        image: 'https://images.unsplash.com/photo-1610189012908-3269f2b7b2d0?w=100',
        unitsSold: 38,
        revenue: 341620,
        stock: 8,
        trend: 'up'
    },
    {
        id: 3,
        name: 'Golden Anarkali Set',
        image: 'https://images.unsplash.com/photo-1583391733958-e02376e9ced3?w=100',
        unitsSold: 32,
        revenue: 511968,
        stock: 5,
        trend: 'down'
    },
    {
        id: 4,
        name: 'Pink Palazzo Suit',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100',
        unitsSold: 28,
        revenue: 195972,
        stock: 15,
        trend: 'stable'
    },
    {
        id: 5,
        name: 'Green Saree with Blouse',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100',
        unitsSold: 25,
        revenue: 274975,
        stock: 10,
        trend: 'up'
    }
];

// Mock Activity Feed
export const mockActivities: Activity[] = [
    {
        id: '1',
        type: 'order_placed',
        message: 'New order #1234 from Priya Sharma',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
        relatedId: '1234'
    },
    {
        id: '2',
        type: 'customer_registered',
        message: 'Rahul Verma registered as a customer',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    },
    {
        id: '3',
        type: 'inventory_updated',
        message: '"Red Lehenga" inventory updated (5 units added)',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        relatedId: '1'
    },
    {
        id: '4',
        type: 'payment_received',
        message: 'Payment received for order #1235 (₹8,499)',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        relatedId: '1235'
    },
    {
        id: '5',
        type: 'review_posted',
        message: 'New 5-star review on "Blue Designer Gown"',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        relatedId: '2'
    }
];

// Mock Low Stock Alerts
export const mockLowStockAlerts: LowStockAlert[] = [
    {
        productId: 3,
        productName: 'Golden Anarkali Set',
        currentStock: 5,
        minStock: 10,
        image: 'https://images.unsplash.com/photo-1583391733958-e02376e9ced3?w=100'
    },
    {
        productId: 2,
        productName: 'Blue Designer Gown',
        currentStock: 8,
        minStock: 15,
        image: 'https://images.unsplash.com/photo-1610189012908-3269f2b7b2d0?w=100'
    },
    {
        productId: 7,
        productName: 'Purple Party Dress',
        currentStock: 3,
        minStock: 10,
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=100'
    }
];

// Mock Pending Reviews
export const mockPendingReviews: PendingReview[] = [
    {
        id: 101,
        productId: 1,
        productName: 'Red Embroidered Lehenga',
        customerName: 'Sneha Kumar',
        rating: 5,
        comment: 'Absolutely stunning! The embroidery work is exquisite and the fit is perfect.',
        createdAt: '2024-11-27T09:00:00Z'
    },
    {
        id: 102,
        productId: 4,
        productName: 'Pink Palazzo Suit',
        customerName: 'Ritu Malhotra',
        rating: 4,
        comment: 'Beautiful design and comfortable fabric. Color is slightly different from the picture.',
        createdAt: '2024-11-26T18:30:00Z'
    }
];

// API-like functions (will be replaced with real API calls later)
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDashboardStats;
};

export const fetchSalesData = async (days: number = 7): Promise<SalesDataPoint[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSalesData.slice(-days);
};

export const fetchRecentOrders = async (limit: number = 10): Promise<RecentOrder[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRecentOrders.slice(0, limit);
};

export const fetchTopProducts = async (limit: number = 5): Promise<TopProduct[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTopProducts.slice(0, limit);
};

export const fetchActivities = async (limit: number = 10): Promise<Activity[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockActivities.slice(0, limit);
};

export const fetchLowStockAlerts = async (): Promise<LowStockAlert[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockLowStockAlerts;
};

export const fetchPendingReviews = async (limit: number = 5): Promise<PendingReview[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPendingReviews.slice(0, limit);
};
