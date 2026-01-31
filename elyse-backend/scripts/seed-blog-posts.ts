import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const c = await pool.connect();
    try {
        console.log('🌱 Seeding blog posts...\n');

        await c.query('DELETE FROM featured_blog_posts');
        await c.query('DELETE FROM blog_posts');

        // Create 6 blog posts
        const posts = [];
        for (let i = 0; i < 6; i++) {
            const title = faker.lorem.sentence({ min: 3, max: 6 });
            const slug = faker.helpers.slugify(title).toLowerCase();

            const res = await c.query(`
            INSERT INTO blog_posts (
                title, slug, excerpt, content, featured_image_url, author, 
                meta_title, meta_description, is_published, published_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            RETURNING id
        `, [
                title,
                slug,
                faker.lorem.paragraph(),
                faker.lorem.paragraphs(3),
                faker.image.urlLoremFlickr({ category: 'fashion' }),
                faker.person.fullName(),
                title,
                faker.lorem.sentence(),
                true
            ]);
            posts.push(res.rows[0].id);
        }

        // Feature the first 3 posts
        console.log('   Setting featured posts...');
        for (let i = 0; i < 3; i++) {
            await c.query(`
            INSERT INTO featured_blog_posts (blog_post_id, display_order)
            VALUES ($1, $2)
        `, [posts[i], i + 1]);
        }

        console.log('\n✅ Blog posts seeded successfully!');

    } catch (e: any) {
        console.error('❌ Error:', e.message);
    } finally {
        c.release();
        await pool.end();
    }
}
run();
