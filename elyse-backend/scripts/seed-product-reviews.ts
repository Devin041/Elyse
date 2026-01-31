import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const c = await pool.connect();
    try {
        console.log('🌱 Seeding product reviews...\n');

        await c.query('DELETE FROM reviews');

        // Fetch valid order items to create reviews for
        // We need to know which user bought which product in which order
        // Use DISTINCT to avoid duplicate potential reviews if order_items has duplicates
        const res = await c.query(`
        SELECT DISTINCT oi.order_id, oi.product_id, o.user_id 
        FROM order_items oi 
        JOIN orders o ON oi.order_id = o.id
    `);

        const potentialReviews = res.rows;
        console.log(`   Found ${potentialReviews.length} potential review opportunities (order items).`);

        let createdCount = 0;

        for (const item of potentialReviews) {
            // 70% chance to leave a review
            if (Math.random() > 0.3) {
                const rating = faker.number.int({ min: 3, max: 5 }); // Mostly positive reviews
                const isApproved = Math.random() > 0.2; // 80% approved

                await c.query(`
                INSERT INTO reviews (
                    product_id, user_id, order_id, 
                    rating, title, comment, 
                    is_approved, helpful_count, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (product_id, user_id, order_id) DO NOTHING
            `, [
                    item.product_id,
                    item.user_id,
                    item.order_id,
                    rating,
                    faker.word.adjective() + ' ' + faker.word.noun(),
                    faker.lorem.sentences(2),
                    isApproved,
                    faker.number.int({ min: 0, max: 20 }),
                    faker.date.past()
                ]);
                createdCount++;
            }
        }

        console.log(`\n✅ Successfully created ${createdCount} product reviews!`);

    } catch (e: any) {
        console.error('❌ Error:', e.message);
    } finally {
        c.release();
        await pool.end();
    }
}
run();
