import { query } from './src/config/database.config';

async function checkImages() {
    try {
        const res = await query(`
            SELECT p.name, pi.url 
            FROM products p 
            JOIN product_images pi ON p.id = pi.product_id 
            WHERE p.slug IN ('new-anarakali-kurti', 'new-classic-kurti', 'new-classis-pirncess')
            AND pi.is_primary = true
        `);
        console.log("Broken Images Check:");
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    }
}

checkImages();
