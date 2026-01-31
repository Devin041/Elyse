import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // 'pending', 'approved', 'rejected'
        const productId = searchParams.get('product_id');

        let query = supabase
            .from('reviews')
            .select(`
        *,
        products:product_id (
          name,
          primary_image
        ),
        profiles:user_id (
          full_name,
          email
        )
      `)
            .order('created_at', { ascending: false });

        if (status === 'pending') {
            query = query.eq('is_approved', false);
        } else if (status === 'approved') {
            query = query.eq('is_approved', true);
        }

        if (productId) {
            query = query.eq('product_id', productId);
        }

        const { data: reviews, error } = await query;

        if (error) throw error;

        return NextResponse.json(reviews || []);

    } catch (error: any) {
        console.error('Reviews API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reviews', details: error.message },
            { status: 500 }
        );
    }
}
