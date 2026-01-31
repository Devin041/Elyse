import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { key: string } }
) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: section, error } = await supabase
            .from('product_sections')
            .select('*')
            .eq('section_key', params.key)
            .single();

        if (error) throw error;

        return NextResponse.json(section);

    } catch (error: any) {
        console.error('Get product section error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product section', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { key: string } }
) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const body = await request.json();

        const { data: section, error } = await supabase
            .from('product_sections')
            .update({
                title: body.title,
                subtitle: body.subtitle,
                selection_type: body.selection_type,
                auto_filter: body.auto_filter,
                manual_product_ids: body.manual_product_ids,
                display_order: body.display_order,
                is_enabled: body.is_enabled,
                config: body.config,
            })
            .eq('section_key', params.key)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(section);

    } catch (error: any) {
        console.error('Update product section error:', error);
        return NextResponse.json(
            { error: 'Failed to update product section', details: error.message },
            { status: 500 }
        );
    }
}
