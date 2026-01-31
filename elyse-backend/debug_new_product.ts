import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:HdEkQyOPgAIhMIeD@db.bcqsjztmpslvmkrbgevi.supabase.co:5432/postgres';

async function debugProduct() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log('--- Product Info ---');
        const productRes = await client.query("SELECT * FROM products WHERE slug = 'double-new-haritage-kurti'");
        console.log(JSON.stringify(productRes.rows, null, 2));

        if (productRes.rows.length > 0) {
            const productId = productRes.rows[0].id;
            console.log('\n--- Product Images ---');
            const imagesRes = await client.query("SELECT * FROM product_images WHERE product_id = $1", [productId]);
            console.log(JSON.stringify(imagesRes.rows, null, 2));

            console.log('\n--- Product Variants ---');
            const variantsRes = await client.query("SELECT * FROM product_variants WHERE product_id = $1", [productId]);
            console.log(JSON.stringify(variantsRes.rows, null, 2));
        } else {
            console.log('Product not found by slug: double-new-haritage-kurti');
        }

    } finally {
        await client.end();
    }
}

debugProduct();
