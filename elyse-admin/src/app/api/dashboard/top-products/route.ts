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
        // Get top products by quantity sold
        const { data: topItems, error } = await supabase
            .from('order_items')
            .select(`
                product_id,
                quantity,
                unit_price,
                products:product_id (
                    name,
                    base_price
                )
            `);

        if (error) throw error;

        // Aggregate by product
        const productMap: { [key: string]: any } = {};

        topItems?.forEach(item => {
            const productId = item.product_id;
            const product = item.products as any;
            if (!productMap[productId]) {
                productMap[productId] = {
                    id: productId,
                    name: product?.name || 'Unknown Product',
                    image: '', // Will be populated below
                    totalSold: 0,
                    revenue: 0,
                };
            }
            productMap[productId].totalSold += item.quantity;
            productMap[productId].revenue += item.quantity * parseFloat(item.unit_price || product?.base_price || '0');
        });

        // Fetch images and stock for top products
        const productIds = Object.keys(productMap);
        if (productIds.length > 0) {
            // Fetch images
            const { data: images } = await supabase
                .from('product_images')
                .select('product_id, url, is_primary')
                .in('product_id', productIds)
                .order('is_primary', { ascending: false });

            // Fetch stock from variants
            const { data: variants } = await supabase
                .from('product_variants')
                .select('product_id, stock_quantity')
                .in('product_id', productIds);

            // Map primary images to products
            images?.forEach(img => {
                if (productMap[img.product_id] && !productMap[img.product_id].image) {
                    productMap[img.product_id].image = img.url;
                }
            });

            // Calculate total stock per product
            variants?.forEach(variant => {
                if (productMap[variant.product_id]) {
                    if (!productMap[variant.product_id].stock) {
                        productMap[variant.product_id].stock = 0;
                    }
                    productMap[variant.product_id].stock += variant.stock_quantity || 0;
                }
            });
        }

        // Convert to array and sort by quantity
        const topProducts = Object.values(productMap)
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 5)
            .map(product => ({
                id: product.id,
                name: product.name,
                image: product.image || '/placeholder-product.png',
                unitsSold: product.totalSold, // Component expects unitsSold
                revenue: Math.round(product.revenue || 0),
                stock: product.stock || 0,
                trend: 'stable' as const, // Default trend
            }));

        return NextResponse.json(topProducts);

    } catch (error: any) {
        console.error('Top products error:', error);
        return NextResponse.json([], { status: 200 });
    }
}
