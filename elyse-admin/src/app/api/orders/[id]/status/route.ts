import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

        const body = await request.json();

        const { data: order, error } = await supabase
            .from('orders')
            .update({ order_status: body.status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(order);

    } catch (error: any) {
        console.error('Update order status error:', error);
        return NextResponse.json(
            { error: 'Failed to update order status', details: error.message },
            { status: 500 }
        );
    }
}

// Support PATCH method as well for compatibility
export const PATCH = PUT;
