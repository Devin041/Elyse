import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:HdEkQyOPgAIhMIeD@db.bcqsjztmpslvmkrbgevi.supabase.co:5432/postgres';

async function deepRepair() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log('--- Deep Investigation: Double New Haritage Kurti ---');

        // 1. Get the product record directly
        const productRes = await client.query("SELECT * FROM products WHERE slug = 'double-new-haritage-kurti'");
        if (productRes.rows.length === 0) {
            console.log('Product not found');
            return;
        }
        const product = productRes.rows[0];
        console.log('Product ID:', product.id);

        // 2. Check if product_images has anything
        const piRes = await client.query("SELECT * FROM product_images WHERE product_id = $1", [product.id]);
        console.log(`product_images count: ${piRes.rows.length}`);

        // 3. Check if product_variant_images has anything
        const pviRes = await client.query("SELECT * FROM product_variant_images WHERE product_id = $1", [product.id]);
        console.log(`product_variant_images count: ${pviRes.rows.length}`);

        if (pviRes.rows.length > 0) {
            for (const img of pviRes.rows) {
                console.log(`Found image in pvi: ${img.image_url}`);
                // Move to product_images
                await client.query(
                    `INSERT INTO product_images (product_id, variant_id, url, is_primary, display_order) 
                     VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
                    [product.id, img.variant_id, img.image_url, img.is_primary, img.display_order]
                );
            }
        }

        // 4. Check for OTHER products with this issue
        console.log('\n--- Checking for orphan images in product_variant_images ---');
        const orphansRes = await client.query(`
            SELECT pvi.* FROM product_variant_images pvi
            LEFT JOIN product_images pi ON pvi.image_url = pi.url AND pvi.product_id = pi.product_id
            WHERE pi.id IS NULL
        `);
        console.log(`Found ${orphansRes.rows.length} orphans.`);

        for (const orphan of orphansRes.rows) {
            console.log(`Fixing orphan: ${orphan.image_url} for product ${orphan.product_id}`);
            await client.query(
                `INSERT INTO product_images (product_id, variant_id, url, is_primary, display_order) 
                 VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
                [orphan.product_id, orphan.variant_id, orphan.image_url, orphan.is_primary, orphan.display_order]
            );
        }

        console.log('--- Deep Repair Complete ---');

    } catch (err) {
        console.error('Repair failed:', err);
    } finally {
        await client.end();
    }
}

deepRepair();
