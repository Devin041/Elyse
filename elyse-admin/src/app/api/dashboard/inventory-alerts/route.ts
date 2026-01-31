import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LOW_STOCK_THRESHOLD = 10;

export async function GET() {
    try {
        const { data: lowStockVariants, error } = await supabase
            .from('product_variants')
            .select(`
                id,
                sku,
                stock_quantity,
                color,
                size,
                products:product_id (
                    id,
                    name,
                    primary_image
                )
            `)
            .lt('stock_quantity', LOW_STOCK_THRESHOLD)
            .order('stock_quantity', { ascending: true })
            .limit(10);

        if (error) throw error;

        const alerts = lowStockVariants?.map(variant => {
            const product = variant.products as any;
            return {
                productId: product?.id,
                productName: product?.name || 'Unknown',
                image: product?.primary_image || '',
                sku: variant.sku,
                variant: `${variant.color || ''} ${variant.size || ''}`.trim(),
                stock: variant.stock_quantity || 0,
                status: variant.stock_quantity === 0 ? 'out_of_stock' : 'low_stock',
            };
        }) || [];

        return NextResponse.json(alerts);

    } catch (error: any) {
        console.error('Inventory alerts error:', error);
        return NextResponse.json([], { status: 200 });
    }
}
