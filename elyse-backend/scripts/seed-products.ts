import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const products = [
    { name: 'Elegant Red Banarasi Saree', cat: 'women', sub: 'women-sarees', price: 4999, sale: 3999, feat: true, news: true, col: ['Red', 'Maroon'], sz: ['Free Size'], stk: 25 },
    { name: 'Floral Cotton Kurti', cat: 'women', sub: 'women-kurtis', price: 899, sale: 809, feat: false, news: true, col: ['Pink', 'Yellow'], sz: ['S', 'M', 'L', 'XL'], stk: 10 },
    { name: 'Designer Lehenga', cat: 'women', sub: 'women-lehengas', price: 24999, sale: 22499, feat: true, news: true, col: ['Red', 'Peach'], sz: ['M', 'L'], stk: 5 },
    { name: 'Premium Formal Shirt', cat: 'men', sub: 'men-shirts', price: 1299, sale: 1039, feat: true, col: ['White', 'Blue', 'Black'], sz: ['M', 'L', 'XL'], stk: 15 },
    { name: 'Cotton T-Shirt', cat: 'men', sub: 'men-tshirts', price: 499, sale: 499, col: ['Black', 'White', 'Grey'], sz: ['M', 'L', 'XL'], stk: 25 },
    { name: 'Wedding Kurta', cat: 'men', sub: 'men-kurtas', price: 2499, sale: 2249, feat: true, col: ['Cream', 'Gold'], sz: ['M', 'L', 'XL'], stk: 10 },
    { name: 'Boys Set', cat: 'kids', sub: 'kids-boys', price: 899, sale: 719, col: ['Blue', 'Red'], sz: ['4-5 Years', '6-7 Years'], stk: 12 },
    { name: 'Girls Frock', cat: 'kids', sub: 'kids-girls', price: 699, sale: 594, feat: true, news: true, col: ['Pink', 'Purple'], sz: ['4-5 Years', '6-7 Years'], stk: 20 },
    { name: 'Kundan Necklace', cat: 'accessories', sub: 'accessories-jewelry', price: 1999, sale: 1499, feat: true, col: ['Gold'], sz: ['Free Size'], stk: 50 },
    { name: 'Designer Handbag', cat: 'accessories', sub: 'accessories-bags', price: 1499, sale: 1199, col: ['Black', 'Brown'], sz: ['Free Size'], stk: 15 }
];

async function run() {
    const c = await pool.connect();
    try {
        console.log('🌱 Seeding...\n');
        const cats = await c.query('SELECT id, slug FROM categories');
        const cm: Record<string, string> = {};
        cats.rows.forEach((r: any) => cm[r.slug] = r.id);

        const szs = await c.query('SELECT id, size_name FROM product_sizes');
        const sm: Record<string, string> = {};
        szs.rows.forEach((r: any) => sm[r.size_name] = r.id);

        let pc = 0, cc = 0, vc = 0;
        for (const p of products) {
            const cid = cm[p.cat], scid = cm[p.sub];
            if (!cid || !scid) continue;

            const pr = await c.query('INSERT INTO products (name,slug,description,category_id,subcategory_id,base_price,sale_price,is_featured,is_new_arrival,is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true) RETURNING id',
                [p.name, p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), `Premium ${p.name}`, cid, scid, p.price, p.sale, p.feat || false, p.news || false]);
            const pid = pr.rows[0].id;
            pc++;

            const cids: string[] = [];
            for (const cn of p.col) {
                const cr = await c.query('INSERT INTO product_colors (product_id,color_name) VALUES ($1,$2) RETURNING id', [pid, cn]);
                cids.push(cr.rows[0].id);
                cc++;
            }

            for (const coid of cids) {
                for (const sn of p.sz) {
                    const sid = sm[sn];
                    if (sid) {
                        const sku = `${p.name.substring(0, 3).toUpperCase()}-${pc}-${vc}`;
                        await c.query('INSERT INTO product_variants (product_id,color_id,size_id,stock_quantity,sku) VALUES ($1,$2,$3,$4,$5)', [pid, coid, sid, p.stk, sku]);
                        vc++;
                    }
                }
            }
            console.log(`✓ ${p.name} (${cids.length}×${p.sz.length}=${cids.length * p.sz.length})`);
        }
        console.log(`\n${'='.repeat(50)}\n✅ Products: ${pc}, Colors: ${cc}, Variants: ${vc}\n${'='.repeat(50)}`);
    } catch (e: any) {
        console.error('❌', e.message);
    } finally {
        c.release();
        await pool.end();
    }
}
run();
