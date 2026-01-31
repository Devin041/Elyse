import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const body = await request.json();
        const isFeatured = body.is_featured ?? true;

        const { data: post, error } = await supabase
            .from('blog_posts')
            .update({ is_featured: isFeatured })
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(post);

    } catch (error: any) {
        console.error('Feature blog post error:', error);
        return NextResponse.json(
            { error: 'Failed to feature blog post', details: error.message },
            { status: 500 }
        );
    }
}
