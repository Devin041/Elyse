import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { searchParams } = new URL(request.url);
        const featured = searchParams.get('featured');

        let query = supabase
            .from('blog_posts')
            .select('*')
            .order('published_at', { ascending: false });

        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }

        const { data: posts, error } = await query;

        if (error) throw error;

        return NextResponse.json(posts || []);

    } catch (error: any) {
        console.error('Blog posts API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog posts', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);
        const body = await request.json();

        // 1. Probing: Detect columns. Use baseline if table is empty.
        const { data: sample } = await supabase
            .from('blog_posts')
            .select('*')
            .limit(1)
            .maybeSingle();

        // If table is empty, we don't know the columns. Use a safe baseline.
        // Projects usually start with these from migration 008.
        const BASELINE_COLUMNS = ['title', 'slug', 'excerpt', 'content', 'image_url', 'author_id', 'status', 'published_at', 'meta_title', 'meta_description', 'created_at', 'updated_at'];

        const availableColumns = sample ? Object.keys(sample) : BASELINE_COLUMNS;

        // 2. Dynamic Payload Construction
        const payload: any = {};
        const setIfAvailable = (dbKey: string, value: any, fallbackKey?: string) => {
            if (availableColumns.includes(dbKey)) {
                payload[dbKey] = value;
                return true;
            } else if (fallbackKey && availableColumns.includes(fallbackKey)) {
                payload[fallbackKey] = value;
                return true;
            }
            return false;
        };

        // Standard Mappings
        setIfAvailable('title', body.title);
        setIfAvailable('slug', body.slug || body.title?.toLowerCase().replace(/\s+/g, '-'));
        setIfAvailable('content', body.content);
        setIfAvailable('excerpt', body.excerpt);

        // Image mapping: featured_image (new) -> image_url (old)
        if (!setIfAvailable('featured_image', body.featured_image)) {
            setIfAvailable('image_url', body.featured_image);
        }

        // Author mapping
        setIfAvailable('author_name', body.author_name || 'Elyse Team');

        // SEO mapping
        setIfAvailable('meta_title', body.meta_title || body.title);
        setIfAvailable('meta_description', body.meta_description || body.excerpt);

        // Categorization
        setIfAvailable('category', body.category);
        setIfAvailable('tags', body.tags || []);

        // Status/Published mapping
        // If DB uses 'status' (string) instead of 'is_published' (bool)
        if (availableColumns.includes('status')) {
            payload.status = body.is_published ? 'published' : 'draft';
        } else {
            setIfAvailable('is_published', body.is_published || false);
        }

        setIfAvailable('is_featured', body.is_featured || false);
        setIfAvailable('published_at', body.published_at || new Date().toISOString());

        // 3. Resilient Upsert (by Slug)
        // If the slug already exists, we UPDATE it instead of failing.
        // This handles "Double Click" or "Retry" scenarios gracefully.
        const { data: post, error } = await supabase
            .from('blog_posts')
            .upsert(payload, { onConflict: 'slug' })
            .select()
            .single();

        if (error) {
            console.error('Supabase POST error:', error);
            return NextResponse.json(
                {
                    error: 'Database Persistence Error',
                    message: `Database Error: ${error.message}${error.hint ? ' - ' + error.hint : ''}`,
                    details: error.details,
                    code: error.code
                },
                { status: 500 }
            );
        }

        return NextResponse.json(post, { status: 201 });

    } catch (error: any) {
        console.error('Create blog post error:', error);
        return NextResponse.json(
            { error: 'Failed to create blog post', message: error.message },
            { status: 500 }
        );
    }
}
