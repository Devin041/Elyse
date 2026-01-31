import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const authHeader = request.headers.get('Authorization');

        let supabase;

        if (serviceKey) {
            supabase = createClient(supabaseUrl, serviceKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            });
        } else if (authHeader) {
            supabase = createClient(supabaseUrl, supabaseAnonKey, {
                global: { headers: { Authorization: authHeader } },
            });
        } else {
            supabase = createClient(supabaseUrl, supabaseAnonKey);
        }

        // Get total sales (from delivered orders) - Using correct column order_status
        const { data: salesData, error: salesError } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('order_status', 'delivered');

        if (salesError) throw salesError;

        const totalSales = salesData?.reduce((sum, order) => sum + parseFloat(order.total_amount || '0'), 0) || 0;

        // Get total orders count
        const { count: totalOrders, error: ordersError } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        if (ordersError) throw ordersError;

        // Get total customers count
        const { count: totalCustomers, error: customersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'customer');

        if (customersError) throw customersError;

        // Calculate sales growth (comparing last 30 days vs previous 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const { data: recentSales } = await supabase
            .from('orders')
            .select('total_amount')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .eq('order_status', 'delivered');

        const { data: previousSales } = await supabase
            .from('orders')
            .select('total_amount')
            .gte('created_at', sixtyDaysAgo.toISOString())
            .lt('created_at', thirtyDaysAgo.toISOString())
            .eq('order_status', 'delivered');

        const recentTotal = recentSales?.reduce((sum, order) => sum + parseFloat(order.total_amount || '0'), 0) || 0;
        const previousTotal = previousSales?.reduce((sum, order) => sum + parseFloat(order.total_amount || '0'), 0) || 0;

        const salesGrowth = previousTotal > 0
            ? ((recentTotal - previousTotal) / previousTotal) * 100
            : 0;

        return NextResponse.json({
            totalSales: Math.round(totalSales),
            totalOrders: totalOrders || 0,
            totalCustomers: totalCustomers || 0,
            salesGrowth: parseFloat(salesGrowth.toFixed(1)),
        });

    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}
