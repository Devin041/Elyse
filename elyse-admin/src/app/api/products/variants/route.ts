import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productId, sku, size, color, colorHex, inventoryCount, price } = body;

        if (!productId || !sku || !size) {
            return NextResponse.json({ message: 'Product ID, SKU, and Size are required' }, { status: 400 });
        }

        const supabase = serviceKey
            ? createClient(supabaseUrl, serviceKey)
            : createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabase
            .from('product_variants')
            .insert([
                {
                    product_id: productId,
                    sku: sku,
                    size: size,
                    color: color || null,
                    color_hex: colorHex || null,
                    stock_quantity: inventoryCount || 0, // Mapping to DB schema
                    price: price || 0,
                    is_available: true
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Variant insert error:', error);
            return NextResponse.json({
                message: 'Failed to create variant',
                error: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Variant created successfully',
            data
        }, { status: 201 });

    } catch (error: any) {
        console.error('Variant creation error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
