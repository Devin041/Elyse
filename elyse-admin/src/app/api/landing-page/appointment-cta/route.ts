import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

        const { data: appointmentCta, error } = await supabase
            .from('appointment_cta')
            .select('*')
            .maybeSingle();

        if (error) {
            console.error('Supabase GET error:', error);
            throw error;
        }

        return NextResponse.json(appointmentCta || {});

    } catch (error: any) {
        console.error('Appointment CTA API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch appointment CTA', details: error.message },
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

        // 1. Probing: Get the existing record and its structure
        const { data: existing, error: fetchError } = await supabase
            .from('appointment_cta')
            .select('*')
            .limit(1)
            .maybeSingle();

        if (fetchError) {
            console.error('Probing error:', fetchError);
            return NextResponse.json(
                { error: 'Probing failed', message: fetchError.message },
                { status: 500 }
            );
        }

        // 2. Dynamic Payload Construction
        const payload: any = {};
        const availableColumns = existing ? Object.keys(existing) : [];

        // Helper to safely set values only if the column exists in the DB
        const setIfAvailable = (dbKey: string, bodyValue: any) => {
            if (availableColumns.length === 0 || availableColumns.includes(dbKey)) {
                payload[dbKey] = bodyValue;
            }
        };

        // Mapping Logic: Handle all known schema variations
        if (existing?.id) payload.id = existing.id;
        else if (availableColumns.includes('id')) payload.id = 1;

        // Title/Heading mapping
        setIfAvailable('title', body.title);
        setIfAvailable('heading', body.title);

        // Description/Subheading mapping
        setIfAvailable('description', body.description);
        setIfAvailable('subheading', body.description);

        // CTA Text mapping (Self-healing for both common naming conventions)
        setIfAvailable('cta_text', body.cta_text || "Book Now");
        setIfAvailable('button_text', body.cta_text || "Book Now");

        // Core fields
        setIfAvailable('phone_number', body.phone_number);
        setIfAvailable('whatsapp_number', body.whatsapp_number);
        setIfAvailable('is_enabled', body.is_enabled ?? true);
        setIfAvailable('config', body.config || {});

        // 3. Resilient Dynamic Upsert
        const { data: appointmentCta, error: upsertError } = await supabase
            .from('appointment_cta')
            .upsert(payload, { onConflict: 'id' })
            .select()
            .maybeSingle();

        if (upsertError) {
            console.error('Dynamic Upsert error:', upsertError);
            return NextResponse.json(
                {
                    error: 'Database Persistence Error',
                    message: upsertError.message,
                    details: upsertError.details,
                    hint: upsertError.hint,
                    code: upsertError.code,
                    action: 'dynamic_upsert',
                    table: 'appointment_cta'
                },
                { status: 500 }
            );
        }

        return NextResponse.json(appointmentCta);

    } catch (error: any) {
        console.error('Update appointment CTA error:', error);
        return NextResponse.json(
            {
                error: 'Failed to update appointment CTA',
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            },
            { status: 500 }
        );
    }
}
