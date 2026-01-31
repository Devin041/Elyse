import fs from 'fs';
import path from 'path';

try {
    const envPath = path.resolve('.env.local');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) envVars[key.trim()] = val.trim().replace(/^"|"$/g, '');
    });

    const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
    if (url) {
        // Extract ref from https://<ref>.supabase.co
        const match = url.match(/https:\/\/([^.]+)\.supabase/);
        if (match) {
            console.log("PROJECT_REF=" + match[1]);
        } else {
            console.log("Could not parse ref from URL: " + url);
        }
    } else {
        console.log("NEXT_PUBLIC_SUPABASE_URL not found");
    }
} catch (e) {
    console.error(e);
}
