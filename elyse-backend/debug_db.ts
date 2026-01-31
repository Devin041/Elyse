import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:HdEkQyOPgAIhMIeD@db.bcqsjztmpslvmkrbgevi.supabase.co:5432/postgres';

async function debugProduct() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log('--- Product Info ---');
        const productRes = await client.query("SELECT * FROM products WHERE slug = 'new-haritage-queen'");
        console.log(JSON.stringify(productRes.rows, null, 2));

        if (productRes.rows.length > 0) {
            const productId = productRes.rows[0].id;
            console.log('\n--- Product Images ---');
            const imagesRes = await client.query("SELECT * FROM product_images WHERE product_id = $1", [productId]);
            console.log(JSON.stringify(imagesRes.rows, null, 2));

            console.log('\n--- Product Variants ---');
            const variantsRes = await client.query("SELECT * FROM product_variants WHERE product_id = $1", [productId]);
            console.log(JSON.stringify(variantsRes.rows, null, 2));

            if (variantsRes.rows.length > 0) {
                const variantIds = variantsRes.rows.map(v => v.id);
                console.log('\n--- Product Variant Images ---');
                try {
                    const vImagesRes = await client.query("SELECT * FROM product_variant_images WHERE variant_id = ANY($1)", [variantIds]);
                    console.log(JSON.stringify(vImagesRes.rows, null, 2));
                } catch (e: any) {
                    console.log('product_variant_images table error:', e.message);
                }
            }
        } else {
            console.log('Product not found by slug: new-haritage-queen');
        }

    } finally {
        await client.end();
    }
}

debugProduct();
