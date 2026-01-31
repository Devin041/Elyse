import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isUUID(str: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params;
        const body = await request.json();
        const { variants } = body;

        if (!variants || !Array.isArray(variants)) {
            return NextResponse.json({ message: 'Variants array is required' }, { status: 400 });
        }

        // Initialize Supabase with service key for bulk operations to bypass RLS if possible
        // but fallback to anon if not available
        const supabase = serviceKey
            ? createClient(supabaseUrl, serviceKey)
            : createClient(supabaseUrl, supabaseAnonKey);

        // 1. Resolve Product ID (might be slug)
        let productId = rawId;
        if (!isUUID(rawId)) {
            const { data: product, error: productError } = await supabase
                .from('products')
                .select('id')
                .eq('slug', rawId)
                .single();

            if (productError || !product) {
                return NextResponse.json({ message: 'Product not found' }, { status: 404 });
            }
            productId = product.id;
        }

        // 2. Prepare variants for insertion
        // Mapping inventoryCount -> stock_quantity as per DB schema
        const variantsToInsert = variants.map(v => ({
            product_id: productId,
            sku: v.sku,
            size: v.size,
            color: v.color || null,
            color_hex: v.colorHex || null, // Map colorHex -> color_hex
            stock_quantity: v.inventoryCount || 0, // Map inventoryCount -> stock_quantity
            price: v.price || 0,
            is_available: true
        }));

        // 3. Perform bulk insert
        const { data: createdVariants, error: insertError } = await supabase
            .from('product_variants')
            .insert(variantsToInsert)
            .select();

        if (insertError) {
            console.error('Bulk variant insert error:', insertError);
            return NextResponse.json({
                message: 'Failed to create variants',
                error: insertError.message,
                details: insertError.details
            }, { status: 500 });
        }

        // 4. Handle Image Associations
        // We match by SKU to ensure correct association even if order differs
        const imageInsertions: any[] = [];

        variants.forEach(v => {
            if (v.imageUrls && Array.isArray(v.imageUrls)) {
                // Find the created variant with this SKU
                const match = createdVariants?.find(cv => cv.sku === v.sku);
                if (match) {
                    v.imageUrls.forEach((url: string, index: number) => {
                        imageInsertions.push({
                            product_id: productId,
                            variant_id: match.id,
                            image_url: url,
                            is_primary: index === 0, // Mark first as primary for this variant
                            display_order: index
                        });
                    });
                }
            } else if (v.imageUrl) {
                // Fallback for old single imageUrl
                const match = createdVariants?.find(cv => cv.sku === v.sku);
                if (match) {
                    imageInsertions.push({
                        product_id: productId,
                        variant_id: match.id,
                        image_url: v.imageUrl,
                        is_primary: true,
                        display_order: 0
                    });
                }
            }
        });

        if (imageInsertions.length > 0) {
            const { error: imgError } = await supabase
                .from('product_variant_images')
                .insert(imageInsertions);

            if (imgError) {
                console.error('Bulk variant image association error:', imgError);
                // We don't fail the whole request, but we log the error
            }
        }

        return NextResponse.json({
            message: `Successfully created ${createdVariants.length} variants and associated ${imageInsertions.length} images`,
            data: createdVariants
        }, { status: 201 });

    } catch (error: any) {
        console.error('Bulk variant creation error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
