import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:HdEkQyOPgAIhMIeD@db.bcqsjztmpslvmkrbgevi.supabase.co:5432/postgres';

async function repairImages() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log('--- Repairing Images for Double New Haritage Kurti ---');

        // 1. Get the product ID
        const productRes = await client.query("SELECT id FROM products WHERE slug = 'double-new-haritage-kurti'");
        if (productRes.rows.length === 0) {
            console.log('Product not found');
            return;
        }
        const productId = productRes.rows[0].id;

        // 2. Fetch images from the "old" variant images table if they exist
        console.log('Checking product_variant_images...');
        const oldImagesRes = await client.query("SELECT * FROM product_variant_images WHERE product_id = $1", [productId]);
        console.log(`Found ${oldImagesRes.rows.length} images in old table.`);

        for (const img of oldImagesRes.rows) {
            // 3. Insert into the standardized product_images table
            console.log(`Moving image to product_images: ${img.image_url}`);

            // Check if it already exists in product_images to avoid duplicates
            const checkRes = await client.query("SELECT id FROM product_images WHERE url = $1 AND product_id = $2", [img.image_url, productId]);

            if (checkRes.rows.length === 0) {
                await client.query(
                    `INSERT INTO product_images (product_id, variant_id, url, is_primary, display_order) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [productId, img.variant_id, img.image_url, img.is_primary, img.display_order]
                );
                console.log('Successfully inserted.');
            } else {
                console.log('Already exists in new table, skipping.');
            }
        }

        // 4. Update any variants that might still be pointing to the wrong image structure or table
        // (The code is now updated to fetch from product_images based on variant_id)

        console.log('--- Repair Complete ---');

    } catch (err) {
        console.error('Repair failed:', err);
    } finally {
        await client.end();
    }
}

repairImages();
