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

        const { data: review, error } = await supabase
            .from('reviews')
            .update({
                is_approved: true,
                approved_by: body.approved_by, // Admin user ID
                approved_at: new Date().toISOString(),
            })
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(review);

    } catch (error: any) {
        console.error('Approve review error:', error);
        return NextResponse.json(
            { error: 'Failed to approve review', details: error.message },
            { status: 500 }
        );
    }
}
