import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Helper to check if string is valid UUID
function isUUID(str: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params;
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

        // Detect if Lookup is by ID or Slug
        const cleanedId = rawId?.trim();

        if (!cleanedId || cleanedId === 'undefined' || cleanedId === 'null') {
            console.log('Aborting search: Invalid ID/Slug parameter:', cleanedId);
            return NextResponse.json(
                { success: false, error: 'Valid product ID or Slug is required', received: cleanedId },
                { status: 400 }
            );
        }

        const isId = isUUID(cleanedId);
        console.log(`Fetching product detail. Search term: "${cleanedId}", isId: ${isId}`);

        // STRATEGY: Use only the Anon Key for reading product details.
        // This rules out RLS issues where the logged-in user might be restricted 
        // while public/anon access is permitted.
        const publicSupabase = createClient(supabaseUrl, supabaseAnonKey);

        // Build a safer query that doesn't trigger UUID cast errors if not a UUID
        let query = publicSupabase
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
                category:categories!category_id(id, name),
                images:product_images(url, is_primary, variant_id),
                variants:product_variants(id, sku, size, color, stock_quantity, is_available),
                product_tags(tag:tags(name))
            `);

        if (isId) {
            query = query.eq('id', cleanedId);
        } else {
            query = query.eq('slug', cleanedId);
        }

        const { data: productRaw, error } = await query.maybeSingle();

        // ... previous error handling ...

        if (error) throw error;
        if (!productRaw) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Transform data to match frontend expectations
        const totalStock = productRaw.variants?.reduce((sum: number, v: any) => sum + (v.stock_quantity || 0), 0) || 0;

        // Filter for product-level images ONLY (where variant_id is null)
        const sortedImages = (productRaw.images || [])
            .filter((img: any) => img.variant_id === null)
            .sort((a: any, b: any) => (b.is_primary === true ? 1 : 0) - (a.is_primary === true ? 1 : 0));

        const primaryImage = sortedImages.find((img: any) => img.is_primary)?.url || sortedImages[0]?.url || null;

        const product = {
            id: productRaw.id,
            name: productRaw.name,
            slug: productRaw.slug,
            description: productRaw.description,
            price: productRaw.base_price,
            base_price: productRaw.base_price,
            sale_price: productRaw.sale_price,
            category_id: productRaw.category?.id,
            category_name: productRaw.category?.name,
            primary_image: primaryImage,
            images: sortedImages.map((img: any) => ({ url: img.url, is_primary: img.is_primary })),
            stock_quantity: totalStock,
            variants: (productRaw.variants || []).map((v: any) => ({
                id: v.id,
                sku: v.sku,
                size: v.size,
                color: v.color,
                inventory_count: v.stock_quantity, // Map to frontend expectation
                inventoryCount: v.stock_quantity,
                inventory: v.stock_quantity,
                is_available: v.is_available
            })),
            is_active: productRaw.is_active,
            is_new_arrival: productRaw.is_new_arrival,
            tags: (productRaw.product_tags || []).map((pt: any) => pt.tag?.name).filter(Boolean)
        };

        return NextResponse.json({ success: true, data: product });

    } catch (error: any) {
        console.error('Unexpected server error details:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                details: error.message,
                stack: error.stack
            },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const authHeader = request.headers.get('Authorization');

        let supabase;
        if (serviceKey) {
            supabase = createClient(supabaseUrl, serviceKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            });
        } else {
            supabase = createClient(supabaseUrl, supabaseAnonKey, {
                global: { headers: { Authorization: authHeader || '' } },
            });
        }

        const body = await request.json();

        // Detect if Lookup is by ID or Slug
        const cleanedId = rawId?.trim();
        const isId = isUUID(cleanedId);
        const matchColumn = isId ? 'id' : 'slug';

        // 1. Update basic product fields
        const { data: product, error } = await supabase
            .from('products')
            .update({
                name: body.name,
                description: body.description,
                base_price: body.basePrice || body.price, // Map to base_price
                sale_price: body.salePrice || body.sale_price,
                category_id: body.categoryId || body.category_id,
                subcategory_id: body.subcategory_id || null,
                is_active: body.isActive,
                is_featured: body.isFeatured,
                is_new_arrival: body.isNewArrival
            })
            .eq(matchColumn, cleanedId)
            .select()
            .single();

        if (error) throw error;

        // 2. Handle images if provided in body
        if (body.images && Array.isArray(body.images)) {
            console.log(`Updating images for product ${cleanedId}:`, body.images?.length);

            // Delete existing product-level images (variant_id IS NULL)
            await supabase
                .from('product_images')
                .delete()
                .eq('product_id', product.id)
                .is('variant_id', null);

            // Insert new images
            if (body.images.length > 0) {
                const newImages = body.images.map((url: string, index: number) => ({
                    product_id: product.id,
                    url,
                    is_primary: index === 0,
                    display_order: index,
                    variant_id: null
                }));

                await supabase.from('product_images').insert(newImages);
            }
        }

        // 3. Handle tags if provided
        if (body.tags && Array.isArray(body.tags)) {
            console.log(`Updating tags for product ${cleanedId}:`, body.tags);

            // Delete existing tags
            await supabase
                .from('product_tags')
                .delete()
                .eq('product_id', product.id);

            // Process tags
            for (const tagName of body.tags) {
                const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                // Ensure tag exists
                const { data: tag, error: tagError } = await supabase
                    .from('tags')
                    .upsert({ name: tagName, slug: tagSlug }, { onConflict: 'slug' })
                    .select()
                    .single();

                if (!tagError && tag) {
                    await supabase
                        .from('product_tags')
                        .insert({ product_id: product.id, tag_id: tag.id });
                }
            }
        }

        return NextResponse.json({ success: true, data: product });

    } catch (error: any) {
        console.error('Update product error:', error);
        return NextResponse.json(
            { error: 'Failed to update product', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service key for delete

        const supabase = createClient(supabaseUrl, serviceKey || supabaseAnonKey);

        const cleanedId = rawId?.trim();
        const isId = isUUID(cleanedId);
        const matchColumn = isId ? 'id' : 'slug';

        // 1. First, find the product ID if we only have the slug
        let productId = cleanedId;
        if (!isId) {
            const { data: product, error: fetchError } = await supabase
                .from('products')
                .select('id')
                .eq('slug', cleanedId)
                .single();

            if (fetchError || !product) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }
            productId = product.id;
        }

        // 2. Check for blocking Customer Orders (Order Items)
        // We do this BEFORE trying to delete to give a better error message
        const { data: blockingItems } = await supabase
            .from('order_items')
            .select(`
                id,
                order:orders (
                    order_number
                )
            `)
            .eq('product_id', productId);

        if (blockingItems && blockingItems.length > 0) {
            // Extract unique order numbers
            const orderNumbers = Array.from(new Set(
                blockingItems.map((item: any) => item.order?.order_number || 'Unknown')
            ));

            return NextResponse.json(
                {
                    error: `Cannot delete. This product is in ${blockingItems.length} order(s): #${orderNumbers.join(', #')}. Please delete these orders first.`
                },
                { status: 400 }
            );
        }

        // 3. Delete related records explicitly (Manual Cascade)
        // If we reached here, there are NO order items, so it's safe to clean up variants/images.

        // Delete Images
        const { error: imagesError } = await supabase
            .from('product_images')
            .delete()
            .eq('product_id', productId);

        if (imagesError) console.warn('Warning: Failed to delete images:', imagesError);

        // Delete Variants
        const { error: variantsError } = await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', productId);

        if (variantsError) console.warn('Warning: Failed to delete variants:', variantsError);

        // 4. Delete the Product
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;

        return NextResponse.json({ message: 'Product deleted successfully' });

    } catch (error: any) {
        console.error('Delete product error:', error);
        return NextResponse.json(
            { error: 'Failed to delete product', details: error.message },
            { status: 500 }
        );
    }
}
