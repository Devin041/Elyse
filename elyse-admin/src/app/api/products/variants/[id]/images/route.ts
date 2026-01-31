import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// GET all images for a specific variant
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: variantId } = await params;

        const supabase = serviceKey
            ? createClient(supabaseUrl, serviceKey)
            : createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabase
            .from('product_variant_images')
            .select('*')
            .eq('variant_id', variantId)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Fetch variant images error:', error);
            return NextResponse.json({ message: 'Failed to fetch images', error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST new images for a specific variant
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: variantId } = await params;
        const body = await request.json();
        const { images } = body; // Array of URLs

        if (!images || !Array.isArray(images)) {
            return NextResponse.json({ message: 'Images array is required' }, { status: 400 });
        }

        const supabase = serviceKey
            ? createClient(supabaseUrl, serviceKey)
            : createClient(supabaseUrl, supabaseAnonKey);

        // 1. Get product_id for this variant
        const { data: variant, error: vError } = await supabase
            .from('product_variants')
            .select('product_id')
            .eq('id', variantId)
            .single();

        if (vError || !variant) {
            return NextResponse.json({ message: 'Variant not found' }, { status: 404 });
        }

        // 2. Insert new image records
        const imagesToInsert = images.map((url, index) => ({
            product_id: variant.product_id,
            variant_id: variantId,
            image_url: url,
            display_order: index,
            is_primary: index === 0
        }));

        const { data, error } = await supabase
            .from('product_variant_images')
            .insert(imagesToInsert)
            .select();

        if (error) {
            console.error('Insert variant images error:', error);
            return NextResponse.json({ message: 'Failed to associate images', error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Images associated successfully', data }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
