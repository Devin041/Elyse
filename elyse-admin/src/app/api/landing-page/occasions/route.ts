import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: occasions, error } = await supabase
            .from('occasion_categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        return NextResponse.json(occasions || []);

    } catch (error: any) {
        console.error('Occasions API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch occasions', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const body = await request.json();

        const { data: occasion, error } = await supabase
            .from('occasion_categories')
            .insert([
                {
                    name: body.name,
                    description: body.description,
                    image_url: body.image_url,
                    link: body.link,
                    slug: body.slug,
                    display_order: body.display_order || 0,
                    is_enabled: body.is_enabled !== undefined ? body.is_enabled : true,
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(occasion, { status: 201 });

    } catch (error: any) {
        console.error('Create occasion error:', error);
        return NextResponse.json(
            { error: 'Failed to create occasion', details: error.message },
            { status: 500 }
        );
    }
}
