import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

        const { data: giftCards, error } = await supabase
            .from('gift_cards_banner')
            .select('*')
            .single();

        if (error) throw error;

        return NextResponse.json(giftCards);

    } catch (error: any) {
        console.error('Gift cards API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch gift cards banner', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

        const body = await request.json();

        const { data: giftCards, error } = await supabase
            .from('gift_cards_banner')
            .upsert({
                id: 1,
                title: body.title,
                description: body.description,
                background_image_url: body.background_image_url,
                cta_text: body.cta_text,
                cta_link: body.cta_link,
                overlay_opacity: body.overlay_opacity,
                text_color: body.text_color,
                button_bg_color: body.button_bg_color,
                button_text_color: body.button_text_color,
                is_enabled: body.is_enabled,
            }, { onConflict: 'id' })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(giftCards);

    } catch (error: any) {
        console.error('Update gift cards error:', error);
        return NextResponse.json(
            { error: 'Failed to update gift cards banner', details: error.message },
            { status: 500 }
        );
    }
}
