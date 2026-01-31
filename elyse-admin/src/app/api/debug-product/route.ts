
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const slug = 'new-classis-pirncess'; // The failing slug

        // Test 2: Full Relation Fetch (Fixed Version)
        const { data: step2, error: error2 } = await supabase
            .from('products')
            .select(`
                id,
                name,
                slug,
                description,
                base_price,
                sale_price,
                is_active,
                created_at,
                is_new_arrival,
                subcategory_id,
                category:categories!category_id(id, name),
                images:product_images(id, url, is_primary, display_order),
                variants:product_variants(id, sku, size, color, stock_quantity, is_available)
            `)
            .eq('slug', slug)
            .single();

        return NextResponse.json({
            success: !error2,
            data: step2,
            error: error2
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
