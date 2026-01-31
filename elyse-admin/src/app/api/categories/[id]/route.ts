import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Use service role key for admin operations to bypass RLS if needed
        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

        // 1. Check for associated products first
        const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', id);

        if (countError) {
            console.error('Check products error:', countError);
            // If column doesn't exist, we might proceed, but safer to throw.
            // Assuming category_id exists.
            if (countError.code !== 'PGRST100') throw countError;
        }

        if (count && count > 0) {
            return NextResponse.json(
                { error: `Cannot delete category: ${count} products are still linked to it. Please move or delete them first.` },
                { status: 400 } // Bad Request
            );
        }

        // 2. Proceed with delete
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            // Check for other FK constraints (e.g. subcategories)
            if (error.code === '23503') {
                return NextResponse.json(
                    { error: 'Cannot delete category because it is referenced by other records (e.g. subcategories or products).' },
                    { status: 400 }
                );
            }
            throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Delete category error:', error);
        return NextResponse.json(
            { error: 'Failed to delete category', details: error.message },
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

        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

        const body = await request.json();

        // Prepare update data
        const updateData: any = {
            name: body.name,
            slug: body.slug,
            description: body.description,
            image_url: body.imageUrl,
            is_active: body.isActive,
        };

        // Only include parent_id if it's explicitly passed (it can be null)
        if (body.parent_id !== undefined) {
            updateData.parent_id = body.parent_id;
        }

        const { data: category, error } = await supabase
            .from('categories')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data: category });

    } catch (error: any) {
        console.error('Update category error:', error);
        return NextResponse.json(
            { error: 'Failed to update category', details: error.message },
            { status: 500 }
        );
    }
}
