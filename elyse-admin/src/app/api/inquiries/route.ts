import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { inquirySchema } from '@/lib/validations/landingPage';

// POST: Public submission of a contact inquiry
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = inquirySchema.parse(body);

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, serviceRoleKey);

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

        if (error) throw error;

        return NextResponse.json({ message: 'Inquiry submitted successfully', data }, { status: 201 });

    } catch (error: any) {
        console.error('Inquiry submission error:', error);
        return NextResponse.json(
            { error: 'Failed to submit inquiry', details: error.message },
            { status: 500 }
        );
    }
}

// GET: Admin retrieval of inquiries
export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const { data: inquiries, error } = await supabase
            .from('contact_inquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(inquiries);

    } catch (error: any) {
        console.error('Fetch inquiries error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch inquiries', details: error.message },
            { status: 500 }
        );
    }
}
