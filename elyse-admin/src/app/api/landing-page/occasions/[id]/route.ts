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

        const { data: occasion, error } = await supabase
            .from('occasion_categories')
            .update({
                name: body.name,
                description: body.description,
                image_url: body.image_url,
                link: body.link,
                slug: body.slug,
                display_order: body.display_order,
                is_enabled: body.is_enabled,
            })
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(occasion);

    } catch (error: any) {
        console.error('Update occasion error:', error);
        return NextResponse.json(
            { error: 'Failed to update occasion', details: error.message },
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
            .from('occasion_categories')
            .delete()
            .eq('id', params.id);

        if (error) throw error;

        return NextResponse.json({ message: 'Occasion deleted successfully' });

    } catch (error: any) {
        console.error('Delete occasion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete occasion', details: error.message },
            { status: 500 }
        );
    }
}
