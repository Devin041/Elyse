import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, data: categories || [] });

    } catch (error: any) {
        console.error('Categories API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories', details: error.message },
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

        const { data: category, error } = await supabase
            .from('categories')
            .insert([
                {
                    name: body.name,
                    slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
                    description: body.description,
                    image_url: body.imageUrl,
                    is_active: body.isActive,
                    parent_id: body.parent_id || null,
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data: category }, { status: 201 });

    } catch (error: any) {
        console.error('Create category error:', error);
        return NextResponse.json(
            { error: 'Failed to create category', details: error.message },
            { status: 500 }
        );
    }
}
