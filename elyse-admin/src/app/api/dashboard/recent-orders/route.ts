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
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                id,
                order_number,
                total_amount,
                order_status,
                payment_status,
                created_at,
                shipping_full_name,
                customer_email,
                order_items(id)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        // Format orders for display - MUST match RecentOrder interface
        const formattedOrders = orders?.map(order => ({
            id: order.id,
            orderNumber: order.order_number,
            customerName: order.shipping_full_name || order.customer_email || 'Guest',
            createdAt: order.created_at, // Component expects createdAt
            total: parseFloat(order.total_amount || '0'),
            paymentStatus: (order.payment_status || 'pending') as 'paid' | 'pending' | 'failed',
            orderStatus: (order.order_status || 'pending') as 'pending' | 'processing' | 'completed' | 'cancelled' | 'shipped',
            items: Array.isArray(order.order_items) ? order.order_items.length : 0,
        })) || [];

        return NextResponse.json(formattedOrders);

    } catch (error: any) {
        console.error('Recent orders error:', error);
        return NextResponse.json([], { status: 200 }); // Return empty array instead of error
    }
}
