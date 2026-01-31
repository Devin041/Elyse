import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const c = await pool.connect();
  try {
    console.log('🌱 Seeding landing page content...\n');

    // 1. Hero Sections
    console.log('   Hero Sections...');
    await c.query('DELETE FROM hero_sections');
    await c.query(`
      INSERT INTO hero_sections (title, subtitle, cta_text, cta_link, background_type, background_image_url, cta_bg_color, cta_text_color, display_order, is_enabled)
      VALUES 
      ('Summer Collection 2025', 'Discover the latest trends in summer fashion.', 'Shop Now', '/products', 'image', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop', '#000000', '#ffffff', 1, true),
      ('Elegant Ethnic Wear', 'Traditional styles for modern occasions.', 'Explore Collection', '/category/women', 'image', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1974&auto=format&fit=crop', '#e11d48', '#ffffff', 2, true)
    `);

    // 2. Occasion Categories
    console.log('   Occasion Categories...');
    await c.query('DELETE FROM occasion_categories');
    await c.query(`
      INSERT INTO occasion_categories (name, image_url, display_order, is_enabled)
      VALUES 
      ('Wedding', 'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=1974&auto=format&fit=crop', 1, true),
      ('Party', 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1974&auto=format&fit=crop', 2, true),
      ('Casual', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop', 3, true),
      ('Office', 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1995&auto=format&fit=crop', 4, true),
      ('Festival', 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1974&auto=format&fit=crop', 5, true)
    `);

    // 3. Product Sections
    console.log('   Product Sections...');
    await c.query('DELETE FROM product_sections');
    await c.query(`
      INSERT INTO product_sections (section_key, title, selection_type, auto_filter, is_enabled)
      VALUES 
      ('new_arrivals', 'New Arrivals', 'auto', '{"type": "new_arrival", "limit": 8}', true),
      ('trending', 'Trending Now', 'auto', '{"type": "featured", "limit": 10}', true),
      ('best_sellers', 'Best Sellers', 'manual', null, true)
    `);

    // 4. Brand Story
    console.log('   Brand Story...');
    await c.query('DELETE FROM brand_story');
    await c.query(`
      INSERT INTO brand_story (heading, subheading, description, background_image_url, background_color, text_color, text_alignment, is_enabled)
      VALUES 
      ('Our Story', 'Crafting Elegance Since 2010', 'Elyse was born from a passion for timeless fashion and sustainable craftsmanship. We believe in creating pieces that not only look beautiful but also tell a story of tradition and modernity woven together.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop', '#f9fafb', '#1f2937', 'left', true)
    `);

    // 5. Gift Cards Banner
    console.log('   Gift Cards Banner...');
    await c.query('DELETE FROM gift_cards_banner');
    await c.query(`
      INSERT INTO gift_cards_banner (title, description, cta_text, cta_link, background_image_url, text_color, button_bg_color, button_text_color, is_enabled)
      VALUES 
      ('Give the Gift of Style', 'Perfect for any occasion. Let them choose their favorite pieces.', 'Buy Gift Card', '/gift-cards', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2024&auto=format&fit=crop', '#ffffff', '#000000', '#ffffff', true)
    `);

    // 6. Appointment CTA
    console.log('   Appointment CTA...');
    await c.query('DELETE FROM appointment_cta');
    await c.query(`
      INSERT INTO appointment_cta (heading, subheading, contact_method, contact_value, button_bg_color, button_text_color, heading_color, subheading_color, is_enabled)
      VALUES 
      ('Book a Personal Styling Session', 'Get expert advice from our fashion consultants.', 'whatsapp', '919876543210', '#000000', '#ffffff', '#111827', '#4b5563', true)
    `);

    // 7. Carousel Tabs
    console.log('   Carousel Tabs...');
    await c.query('DELETE FROM carousel_tabs');
    await c.query('DELETE FROM product_carousel');

    // Create a carousel first
    const carouselRes = await c.query(`
        INSERT INTO product_carousel (section_title, autoplay_interval, show_arrows, show_dots, is_enabled)
        VALUES ('Featured Collections', 3000, true, true, true)
        RETURNING id
    `);
    const carouselId = carouselRes.rows[0].id;

    // Get some products for manual selection
    const prods = await c.query('SELECT id FROM products LIMIT 4');
    const prodIds = prods.rows.map(r => r.id);

    await c.query(`
      INSERT INTO carousel_tabs (carousel_id, tab_name, product_ids, display_order)
      VALUES 
      ($1, 'Featured', $2, 1),
      ($1, 'On Sale', $2, 2)
    `, [carouselId, prodIds]);

    console.log('\n✅ Landing page content seeded successfully!');

  } catch (e: any) {
    console.error('❌ Error:', e.message);
  } finally {
    c.release();
    await pool.end();
  }
}
run();
