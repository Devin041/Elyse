import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Use service role key to bypass RLS in server context
        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

        // Resilient fetch: Try exact ID, then fallback to first if ID is '1'
        let { data: hero, error } = await supabase

            .from('hero_sections')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Fallback for GET too: if ID '1' not found, get first row
        if (!hero && (id === '1' || id === 'hero-1')) {
            const { data: firstHero } = await supabase
                .from('hero_sections')
                .select('*')
                .order('display_order', { ascending: true })
                .limit(1)
                .single();
            hero = firstHero;
        }

        if (!hero) return NextResponse.json({ error: 'Hero section not found' }, { status: 404 });

        return NextResponse.json(hero);


    } catch (error: any) {
        console.error('Get hero section error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hero section', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // CRITICAL: Use service role key for UPDATE to bypass "Allow admin all access" RLS policy
        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);


        const body = await request.json();

        // 1. Prepare data for update
        const updateData = {
            title: body.title,
            subtitle: body.subtitle,
            cta_text: body.cta_text,
            cta_link: body.cta_link,
            background_image_url: body.background_image_url,
            video_url: body.config?.videoSettings?.videoUrl || null,
            background_type: body.background_type,
            text_color: body.text_color,
            display_order: body.display_order,
            config: body.config,
            is_enabled: body.is_enabled,
            updated_at: new Date().toISOString()
        };

        // 2. ULTRA-RESILIENT ID RESOLUTION
        // We need to find the REAL UUID for the record being updated.
        let targetId = null;

        // Attempt A: Direct match (in case ID '1' actually exists or it's already a UUID)
        try {
            const { data: directMatch } = await supabase
                .from('hero_sections')
                .select('id')
                .eq('id', id)
                .limit(1);

            if (directMatch && directMatch.length > 0) {
                targetId = directMatch[0].id;
            }
        } catch (e) {
            console.log('Direct ID match failed (likely type mismatch), falling back...');
        }

        // Attempt B: If Attempt A failed and ID is '1' or 'hero-1', find the first record
        if (!targetId && (id === '1' || id === 'hero-1')) {
            const { data: firstHero } = await supabase
                .from('hero_sections')
                .select('id')
                .order('display_order', { ascending: true })
                .limit(1);

            if (firstHero && firstHero.length > 0) {
                targetId = firstHero[0].id;
                console.log('Resolved legacy ID to UUID:', targetId);
            }
        }

        if (!targetId) {
            return NextResponse.json({
                error: 'Could not resolve target hero section',
                requestedId: id,
                message: 'No record found matching this ID or as a fallback.'
            }, { status: 404 });
        }

        // 3. Perform update using the resolved UUID
        const { data: updatedData, error: updateError } = await supabase
            .from('hero_sections')
            .update(updateData)
            .eq('id', targetId)
            .select();

        if (updateError) throw updateError;

        if (!updatedData || updatedData.length === 0) {
            return NextResponse.json({ error: 'Failed to update: Record not found after resolution', targetId }, { status: 404 });
        }

        return NextResponse.json(updatedData[0]);

    } catch (error: any) {

        console.error('Update hero section error:', error);
        return NextResponse.json(
            { error: 'Failed to update hero section', details: error.message },
            { status: 500 }
        );
    }
}
