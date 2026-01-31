import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:HdEkQyOPgAIhMIeD@db.bcqsjztmpslvmkrbgevi.supabase.co:5432/postgres';

async function checkProduct() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        const slug = 'double-new-haritage-kurti';
        const pRes = await client.query('SELECT id, name, category_id FROM products WHERE slug = $1', [slug]);

        if (pRes.rows.length === 0) {
            console.log('Product not found for slug:', slug);
            return;
        }

        const productId = pRes.rows[0].id;
        console.log('--- Product Info ---');
        console.log(pRes.rows[0]);

        console.log('\n--- product_images ---');
        const piRes = await client.query('SELECT * FROM product_images WHERE product_id = $1', [productId]);
        console.log(piRes.rows);

        console.log('\n--- product_variant_images ---');
        const pviRes = await client.query('SELECT * FROM product_variant_images WHERE product_id = $1', [productId]);
        console.log(pviRes.rows);

        console.log('\n--- variants ---');
        const vRes = await client.query('SELECT id, sku, size, color FROM product_variants WHERE product_id = $1', [productId]);
        console.log(vRes.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkProduct();
