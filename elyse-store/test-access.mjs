import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing since we probably don't have dotenv setup for standalone script easily
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) envVars[key.trim()] = val.trim().replace(/^"|"$/g, '');
});

const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
const key = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(url, key);

console.log("Testing connection to 'landing_page_settings'...");

const { data, error } = await supabase.from('landing_page_settings').select('*');

if (error) {
    console.error("Error:", error.message);
} else {
    console.log("Success! Rows found:", data.length);
    if (data.length > 0) {
        console.log("First row key:", data[0].key);
    } else {
        console.log("WARNING: 0 rows returned. RLS might be blocking access.");
    }
}
