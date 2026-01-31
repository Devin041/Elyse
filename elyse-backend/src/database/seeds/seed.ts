import { query } from '../../config/database.config';
import pool from '../../config/database.config';
import logger from '../../utils/logger';

/**
 * Database Seeder
 * Populates database with sample data for development
 */

export async function seedDatabase() {
    try {
        logger.info('Starting database seeding...');

        // Seed users (Admin)
        await seedUsers();

        // Seed sample products
        await seedProducts();

        logger.info('🌱 Database seeding completed successfully!');
    } catch (error) {
        logger.error('Database seeding failed', { error });
        throw error;
    }
}

async function seedProducts() {
    logger.info('Seeding sample products...');

    // Get categories
    const categoriesResult = await query('SELECT id, slug FROM categories');
    const categories = categoriesResult.rows;

    const womenCategory = categories.find((c: any) => c.slug === 'women');
    const menCategory = categories.find((c: any) => c.slug === 'men');

    // Sample products for women
    const womenProducts = [
        {
            name: 'Classic White Shirt',
            slug: 'classic-white-shirt',
            description: 'Timeless white cotton shirt perfect for any occasion',
            basePrice: 1299,
            salePrice: 999,
            categoryId: womenCategory?.id,
            sku: 'WOM-SH-001',
            fabric: '100% Cotton',
            careInstructions: 'Machine wash cold, tumble dry low',
            isFeatured: true,
            isNewArrival: true,
        },
        {
            name: 'Floral Summer Dress',
            slug: 'floral-summer-dress',
            description: 'Beautiful floral print dress for summer days',
            basePrice: 2499,
            categoryId: womenCategory?.id,
            sku: 'WOM-DR-001',
            fabric: 'Cotton Blend',
            careInstructions: 'Hand wash cold',
            isNewArrival: true,
            isFeatured: false,
            salePrice: null,
        },
        {
            name: 'Denim Jacket',
            slug: 'denim-jacket',
            description: 'Classic denim jacket with a modern fit',
            basePrice: 3499,
            salePrice: 2799,
            categoryId: womenCategory?.id,
            sku: 'WOM-JK-001',
            fabric: 'Denim',
            careInstructions: 'Machine wash cold',
            isFeatured: true,
            isNewArrival: false,
        },
    ];

    // Sample products for men
    const menProducts = [
        {
            name: 'Oxford Button-Down Shirt',
            slug: 'oxford-button-down-shirt',
            description: 'Premium oxford shirt for the modern gentleman',
            basePrice: 1499,
            categoryId: menCategory?.id,
            sku: 'MEN-SH-001',
            fabric: '100% Cotton Oxford',
            careInstructions: 'Machine wash cold',
            isFeatured: true,
            isNewArrival: false,
            salePrice: null,
        },
        {
            name: 'Slim Fit Chinos',
            slug: 'slim-fit-chinos',
            description: 'Comfortable slim fit chinos in versatile colors',
            basePrice: 1999,
            salePrice: 1599,
            categoryId: menCategory?.id,
            sku: 'MEN-PT-001',
            fabric: 'Cotton Twill',
            careInstructions: 'Machine wash warm',
            isFeatured: false,
            isNewArrival: false,
        },
    ];

    const allProducts = [...womenProducts, ...menProducts];

    for (const product of allProducts) {
        // Insert product
        const productResult = await query(
            `INSERT INTO products (name, slug, description, base_price, sale_price, category_id, sku, fabric, care_instructions, is_featured, is_new_arrival)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (slug) DO NOTHING
       RETURNING id`,
            [
                product.name,
                product.slug,
                product.description,
                product.basePrice,
                product.salePrice || null,
                product.categoryId,
                product.sku,
                product.fabric,
                product.careInstructions,
                product.isFeatured,
                product.isNewArrival,
            ]
        );

        if (productResult.rows.length > 0) {
            const productId = productResult.rows[0].id;

            // Add variants (sizes)
            const sizes = ['S', 'M', 'L', 'XL'];
            for (const size of sizes) {
                await query(
                    `INSERT INTO product_variants (product_id, sku, size, inventory_count)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (sku) DO NOTHING`,
                    [productId, `${product.sku}-${size}`, size, Math.floor(Math.random() * 50) + 10]
                );
            }

            logger.info(`  ✓ Seeded product: ${product.name}`);
        }
    }

    logger.info(`Seeded ${allProducts.length} sample products`);
}

async function seedUsers() {
    logger.info('Seeding users...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO UPDATE 
         SET role = $5, password_hash = $2, email_verified = $6`,
        ['admin@elyse.com', hashedPassword, 'Admin', 'User', 'admin', true]
    );
    logger.info('  ✓ Seeded admin user: admin@elyse.com');
}

// CLI interface
if (require.main === module) {
    (async () => {
        try {
            await seedDatabase();
            process.exit(0);
        } catch (error) {
            logger.error('Seed script failed', { error });
            process.exit(1);
        } finally {
            await pool.end();
        }
    })();
}
