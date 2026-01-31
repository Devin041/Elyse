import { query } from './src/config/database.config';
import fetch from 'node-fetch'; // Note: Ensure node-fetch is available or use native fetch in Node 18+

async function auditImages() {
    console.log('--- Starting Cloudinary Image Audit ---');
    try {
        const res = await query(`
            SELECT pi.id, pi.url, p.name as product_name 
            FROM product_images pi
            JOIN products p ON p.id = pi.product_id
        `);

        console.log(`Checking ${res.rows.length} images...`);

        const broken = [];
        for (const row of res.rows) {
            try {
                const response = await fetch(row.url, { method: 'HEAD' });
                if (response.status === 404) {
                    console.log(`❌ BROKEN: [${row.product_name}] - ${row.url}`);
                    broken.push(row);
                }
            } catch (err) {
                console.log(`⚠️ ERROR checking [${row.product_name}]: ${err.message}`);
            }
        }

        console.log('\n--- Audit Complete ---');
        console.log(`Total checked: ${res.rows.length}`);
        console.log(`Total broken: ${broken.length}`);

        if (broken.length > 0) {
            console.log('\nPlease re-upload images for these products in the Admin Panel.');
        }
    } catch (err) {
        console.error('Audit failed:', err);
    }
}

auditImages();
