import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

        const { data, error } = await supabase
            .from('landing_page_settings')
            .select('*');

        if (error) throw error;

        // Convert array of key-values to a single object
        const settings = data?.reduce((acc: any, item: any) => {
            acc[item.key] = item.value;
            return acc;
        }, {}) || {};

        return NextResponse.json({ success: true, data: settings });

    } catch (error: any) {
        console.error('Fetch landing page settings error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

        const body = await request.json();
        const { key, value } = body;

        if (!key || !value) {
            return NextResponse.json(
                { error: 'Missing key or value' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('landing_page_settings')
            .upsert({ key, value, updated_at: new Date().toISOString() })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('Update landing page settings error:', error);
        return NextResponse.json(
            { error: 'Failed to update settings', details: error.message },
            { status: 500 }
        );
    }
}
