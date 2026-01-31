import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: post, error } = await supabase
            .from('blog_posts')
            .select(`
        *,
        profiles:author_id (
          full_name,
          email
        )
      `)
            .eq('id', params.id)
            .single();

        if (error) throw error;

        if (!post) {
            return NextResponse.json(
                { error: 'Blog post not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(post);

    } catch (error: any) {
        console.error('Get blog post error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog post', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);
        const body = await request.json();

        // 1. Probing: Detect columns
        const { data: existing } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', params.id)
            .maybeSingle();

        if (!existing) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const availableColumns = Object.keys(existing);

        // 2. Dynamic Payload Construction
        const payload: any = {};
        const setIfAvailable = (dbKey: string, value: any) => {
            if (availableColumns.includes(dbKey)) {
                payload[dbKey] = value;
                return true;
            }
            return false;
        };

        // Standard Mappings
        setIfAvailable('title', body.title);
        setIfAvailable('slug', body.slug);
        setIfAvailable('content', body.content);
        setIfAvailable('excerpt', body.excerpt);

        // Image mapping
        if (!setIfAvailable('featured_image', body.featured_image)) {
            setIfAvailable('image_url', body.featured_image);
        }

        // Author mapping
        setIfAvailable('author_name', body.author_name);

        // SEO mapping
        setIfAvailable('meta_title', body.meta_title);
        setIfAvailable('meta_description', body.meta_description);

        // Categorization
        setIfAvailable('category', body.category);
        setIfAvailable('tags', body.tags);

        // Status/Published mapping
        if (availableColumns.includes('status')) {
            payload.status = body.is_published ? 'published' : 'draft';
        } else {
            setIfAvailable('is_published', body.is_published);
        }

        setIfAvailable('is_featured', body.is_featured);
        setIfAvailable('published_at', body.published_at || new Date().toISOString());

        // 3. Resilient Update
        const { data: post, error } = await supabase
            .from('blog_posts')
            .update(payload)
            .eq('id', params.id)
            .select()
            .single();

        if (error) {
            console.error('Supabase PUT error:', error);
            return NextResponse.json(
                {
                    error: 'Database Persistence Error',
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                },
                { status: 500 }
            );
        }

        return NextResponse.json(post);

    } catch (error: any) {
        console.error('Update blog post error:', error);
        return NextResponse.json(
            { error: 'Failed to update blog post', message: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', params.id);

        if (error) throw error;

        return NextResponse.json({ message: 'Blog post deleted successfully' });

    } catch (error: any) {
        console.error('Delete blog post error:', error);
        return NextResponse.json(
            { error: 'Failed to delete blog post', details: error.message },
            { status: 500 }
        );
    }
}
