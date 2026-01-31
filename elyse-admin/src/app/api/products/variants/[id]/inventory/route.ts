import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: variantId } = await params;
        const body = await request.json();
        const { inventoryCount } = body;

        if (inventoryCount === undefined) {
            return NextResponse.json({ message: 'inventoryCount is required' }, { status: 400 });
        }

        const supabase = serviceKey
            ? createClient(supabaseUrl, serviceKey)
            : createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabase
            .from('product_variants')
            .update({ stock_quantity: inventoryCount })
            .eq('id', variantId)
            .select()
            .single();

        if (error) {
            console.error('Inventory update error:', error);
            return NextResponse.json({
                message: 'Failed to update inventory',
                error: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Inventory updated successfully',
            data
        }, { status: 200 });

    } catch (error: any) {
        console.error('Inventory update catch error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
