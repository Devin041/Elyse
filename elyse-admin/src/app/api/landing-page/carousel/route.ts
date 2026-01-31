import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: carousel, error } = await supabase
            .from('product_carousel')
            .select(`
        *,
        carousel_tabs (
          id,
          tab_name,
          product_ids,
          display_order
        )
      `)
            .single();

        if (error) throw error;

        return NextResponse.json(carousel);

    } catch (error: any) {
        console.error('Carousel API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch carousel', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const body = await request.json();

        const { data: carousel, error } = await supabase
            .from('product_carousel')
            .upsert({
                title: body.title,
                subtitle: body.subtitle,
                config: body.config,
                is_enabled: body.is_enabled,
            })
            .select()
            .single();

        if (error) throw error;

        // Update tabs if provided
        if (body.tabs && Array.isArray(body.tabs)) {
            // First, delete existing tabs not in the new list (if we were doing a full sync)
            // But for now, let's just upsert all provided tabs. 
            // Ideally we should handle deletions too.

            // Get existing tabs to find deletions
            const { data: existingTabs } = await supabase
                .from('carousel_tabs')
                .select('id')
                .eq('carousel_id', carousel.id);

            const newTabIds = body.tabs.map((t: any) => t.id).filter((id: string) => id && !id.startsWith('temp-'));
            const tabsToDelete = existingTabs?.filter(t => !newTabIds.includes(t.id)) || [];

            if (tabsToDelete.length > 0) {
                await supabase
                    .from('carousel_tabs')
                    .delete()
                    .in('id', tabsToDelete.map(t => t.id));
            }

            for (const tab of body.tabs) {
                const tabData = {
                    carousel_id: carousel.id,
                    tab_name: tab.tab_name,
                    product_ids: tab.product_ids,
                    display_order: tab.display_order,
                    color: tab.color
                };

                if (tab.id && !tab.id.startsWith('temp-')) {
                    await supabase
                        .from('carousel_tabs')
                        .update(tabData)
                        .eq('id', tab.id);
                } else {
                    await supabase
                        .from('carousel_tabs')
                        .insert(tabData);
                }
            }
        }

        return NextResponse.json(carousel);

    } catch (error: any) {
        console.error('Update carousel error:', error);
        return NextResponse.json(
            { error: 'Failed to update carousel', details: error.message },
            { status: 500 }
        );
    }
}
