import pg from 'pg';
const { Pool } = pg;

const connectionString = "postgresql://postgres:HdEkQyOPgAIhMIeD@db.bcqsjztmpslvmkrbgevi.supabase.co:5432/postgres";
const pool = new Pool({ connectionString });

async function debugProducts() {
    try {
        const res = await pool.query(`
            SELECT p.id, p.name, p.is_active, 
                   (SELECT url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as primary_image
            FROM products p
            ORDER BY p.created_at DESC
            LIMIT 10
        `);
        console.log("Latest Products:");
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

debugProducts();
