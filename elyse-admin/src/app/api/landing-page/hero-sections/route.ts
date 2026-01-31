import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: heroSections, error } = await supabase
            .from('hero_sections')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        return NextResponse.json(heroSections || []);

    } catch (error: any) {
        console.error('Hero sections API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hero sections', details: error.message },
            { status: 500 }
        );
    }
}
