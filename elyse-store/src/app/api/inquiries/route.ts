import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const inquirySchema = z.object({
    name: z.string().min(1, "Full name is required").max(100),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(1, "Subject is required").max(200),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = inquirySchema.parse(body);

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Use service role if available to bypass RLS
        const supabase = serviceRoleKey
            ? createClient(supabaseUrl, serviceRoleKey)
            : createClient(supabaseUrl, supabaseAnonKey);

        console.log('Inserting inquiry into contact_inquiries table');

        const { data, error } = await supabase
            .from('contact_inquiries')
            .insert([{
                name: validatedData.name,
                email: validatedData.email,
                subject: validatedData.subject,
                message: validatedData.message,
                status: 'new'
            }])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            throw error;
        }

        console.log('Inquiry inserted successfully:', data?.id);

        return NextResponse.json({
            success: true,
            message: 'Inquiry submitted successfully',
            data
        }, { status: 201 });

    } catch (error: any) {
        console.error('Storefront inquiry API error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
