import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
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

        // Get all products with their details
        // Get all products with their details
        // Note: price -> base_price, join images and variants
        let query = supabase
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
                category:categories!category_id(name),
                images:product_images(url, is_primary, variant_id),
                variants:product_variants(stock_quantity)
            `);

        // Apply filters
        const { searchParams } = new URL(request.url);
        const isNewArrival = searchParams.get('isNewArrival');

        if (isNewArrival === 'true') {
            query = query.eq('is_new_arrival', true);
        }

        const { data: productsRaw, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match frontend expectations
        const products = productsRaw?.map((p: any) => {
            const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stock_quantity || 0), 0) || 0;

            // Filter for product-level images ONLY (where variant_id is null)
            const sortedImages = (p.images || [])
                .filter((img: any) => img.variant_id === null)
                .sort((a: any, b: any) => (b.is_primary === true ? 1 : 0) - (a.is_primary === true ? 1 : 0));

            const mappedImages = sortedImages?.map((i: any) => ({ url: i.url })) || [];

            return {
                id: p.id,
                name: p.name,
                slug: p.slug,
                description: p.description,
                base_price: p.base_price,
                sale_price: p.sale_price,
                category_name: p.category?.name || 'Uncategorized',
                inventory_count: totalStock,
                is_active: p.is_active,
                images: mappedImages
            };
        });

        return NextResponse.json({ success: true, data: products || [] });

    } catch (error: any) {
        console.error('Products API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products', details: error.message },
            { status: 500 }
        );
    }
}

// Helper to create slug
function createSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

export async function POST(request: Request) {
    // ... setup keys (previous code) ...
    try {
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

        const body = await request.json();

        // Validate and sanitize data
        const slug = createSlug(body.name);
        const subcategoryId = body.subcategory_id || null; // Ensure null if empty
        const categoryId = body.category_id;
        const price = parseFloat(body.basePrice); // Map basePrice to base_price

        // Handle images: Frontend sends 'images' array. We need 'primary_image'.
        // If body.primary_image is missing, take the first one from body.images
        const primaryImage = body.primary_image || (body.images && body.images.length > 0 ? body.images[0] : null);

        console.log('Creating product:', { ...body, slug, primaryImage });

        // 1. Insert Product (Schema: base_price, no stock/primary_image col)
        const { data: product, error } = await supabase
            .from('products')
            .insert([
                {
                    name: body.name,
                    slug: slug, // Added slug
                    description: body.description,
                    base_price: price, // Correct column name
                    category_id: categoryId,
                    subcategory_id: subcategoryId, // Properly nulled
                    is_active: body.isActive ?? true,
                    is_featured: body.isFeatured ?? false,
                    is_new_arrival: body.isNewArrival ?? false, // Capture New Arrival flag
                    sku: body.sku || null,
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error details:', error);
            throw error;
        }

        // 2. Insert Images into product_images table if primaryImage exists
        if (primaryImage) {
            console.log(`Inserting ${body.images?.length} images for product ${product.id}`);
            const { error: imageError } = await supabase
                .from('product_images')
                .insert([
                    {
                        product_id: product.id,
                        url: primaryImage,
                        is_primary: true,
                        display_order: 0,
                        variant_id: null
                    }
                ]);

            if (imageError) {
                console.error('Failed to create primary image:', imageError);
                throw new Error(`Failed to save primary image: ${imageError.message}`);
            }

            // Insert other images if needed
            if (body.images && body.images.length > 1) {
                const otherImagesArr = body.images.slice(1).map((img: string, idx: number) => ({
                    product_id: product.id,
                    url: img,
                    is_primary: false,
                    display_order: idx + 1,
                    variant_id: null
                }));

                const { error: otherImgError } = await supabase.from('product_images').insert(otherImagesArr);
                if (otherImgError) {
                    console.error('Failed to create other images:', otherImgError);
                    throw new Error(`Failed to save gallery images: ${otherImgError.message}`);
                }
            }
        }

        // 3. Handle tags if provided
        if (body.tags && Array.isArray(body.tags)) {
            console.log(`Creating tags for new product ${product.id}:`, body.tags);

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

        return NextResponse.json({ success: true, data: { ...product, primary_image: primaryImage } }, { status: 201 });

    } catch (error: any) {
        // ... err handling ...
        console.error('Create product error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Failed to create product',
                details: error.message,
                hint: error.code === '42501' ? 'Permission denied (RLS). Please add SUPABASE_SERVICE_ROLE_KEY to .env.local' : undefined
            },
            { status: 500 }
        );
    }
}
