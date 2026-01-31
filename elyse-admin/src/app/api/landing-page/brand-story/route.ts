import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: brandStory, error } = await supabase
            .from('brand_story')
            .select('*')
            .single();

        if (error) throw error;

        return NextResponse.json(brandStory);

    } catch (error: any) {
        console.error('Brand story API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch brand story', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const body = await request.json();

        // Brand story is a single row, so we update by ID or upsert
        const { data: brandStory, error } = await supabase
            .from('brand_story')
            .upsert({
                title: body.title,
                content: body.content,
                image_url: body.image_url,
                video_url: body.video_url,
                config: body.config,
                is_enabled: body.is_enabled,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(brandStory);

    } catch (error: any) {
        console.error('Update brand story error:', error);
        return NextResponse.json(
            { error: 'Failed to update brand story', details: error.message },
            { status: 500 }
        );
    }
}
