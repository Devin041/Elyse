import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: imageId } = await params;

        const supabase = serviceKey
            ? createClient(supabaseUrl, serviceKey)
            : createClient(supabaseUrl, supabaseAnonKey);

        const { error } = await supabase
            .from('product_variant_images')
            .delete()
            .eq('id', imageId);

        if (error) {
            console.error('Delete variant image error:', error);
            return NextResponse.json({ message: 'Failed to delete image', error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Image deleted successfully' }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
