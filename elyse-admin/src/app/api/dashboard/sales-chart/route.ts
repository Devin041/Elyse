import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseBuilder = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    return createClient(
        supabaseUrl,
        serviceRoleKey || supabaseAnonKey
    );
};

export async function GET() {
    try {
        const supabase = supabaseBuilder();
        // Get sales data for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: orders, error } = await supabase
            .from('orders')
            .select('created_at, total_amount, order_status')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Group by date
        const salesByDate: { [key: string]: { revenue: number; orders: number } } = {};

        orders?.forEach(order => {
            const date = new Date(order.created_at).toISOString().split('T')[0];
            if (!salesByDate[date]) {
                salesByDate[date] = { revenue: 0, orders: 0 };
            }
            if (order.order_status === 'delivered') { // Corrected column
                salesByDate[date].revenue += parseFloat(order.total_amount || '0');
            }
            salesByDate[date].orders += 1;
        });

        // Convert to array format
        const chartData = Object.entries(salesByDate).map(([date, data]) => ({
            date,
            revenue: Math.round(data.revenue),
            orders: data.orders,
        }));

        return NextResponse.json(chartData);

    } catch (error: any) {
        console.error('Sales chart error:', error);
        return NextResponse.json([], { status: 200 });
    }
}
