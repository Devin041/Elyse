import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Fashion E-commerce Categories with Indian market focus
const categories = [
    {
        name: 'Women',
        slug: 'women',
        description: 'Discover the latest trends in women\'s fashion',
        subcategories: [
            { name: 'Sarees', slug: 'women-sarees', description: 'Traditional and designer sarees' },
            { name: 'Kurtis & Kurtas', slug: 'women-kurtis', description: 'Ethnic kurtis and kurtas' },
            { name: 'Lehengas', slug: 'women-lehengas', description: 'Bridal and festive lehengas' },
            { name: 'Dresses', slug: 'women-dresses', description: 'Western dresses for every occasion' },
            { name: 'Tops & Tunics', slug: 'women-tops', description: 'Trendy tops and tunics' },
            { name: 'Ethnic Wear', slug: 'women-ethnic', description: 'Traditional Indian wear' },
            { name: 'Western Wear', slug: 'women-western', description: 'Contemporary western outfits' }
        ]
    },
    {
        name: 'Men',
        slug: 'men',
        description: 'Stylish clothing for modern men',
        subcategories: [
            { name: 'Shirts', slug: 'men-shirts', description: 'Formal and casual shirts' },
            { name: 'T-Shirts', slug: 'men-tshirts', description: 'Comfortable t-shirts' },
            { name: 'Kurtas', slug: 'men-kurtas', description: 'Traditional kurtas and sherwanis' },
            { name: 'Jeans & Trousers', slug: 'men-jeans', description: 'Denim and formal trousers' },
            { name: 'Ethnic Wear', slug: 'men-ethnic', description: 'Traditional menswear' }
        ]
    },
    {
        name: 'Kids',
        slug: 'kids',
        description: 'Adorable outfits for little ones',
        subcategories: [
            { name: 'Boys', slug: 'kids-boys', description: 'Clothing for boys' },
            { name: 'Girls', slug: 'kids-girls', description: 'Clothing for girls' },
            { name: 'Infants', slug: 'kids-infants', description: 'Soft clothing for babies' }
        ]
    },
    {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Complete your look with accessories',
        subcategories: [
            { name: 'Jewelry', slug: 'accessories-jewelry', description: 'Fashion and traditional jewelry' },
            { name: 'Bags', slug: 'accessories-bags', description: 'Handbags and clutches' },
            { name: 'Footwear', slug: 'accessories-footwear', description: 'Shoes and sandals' },
            { name: 'Scarves & Stoles', slug: 'accessories-scarves', description: 'Elegant scarves and dupattas' }
        ]
    },
    {
        name: 'Festive Collection',
        slug: 'festive',
        description: 'Special occasion and festive wear',
        subcategories: [
            { name: 'Wedding Collection', slug: 'festive-wedding', description: 'Bridal and wedding outfits' },
            { name: 'Diwali Special', slug: 'festive-diwali', description: 'Festive Diwali collection' },
            { name: 'Party Wear', slug: 'festive-party', description: 'Party and celebration outfits' }
        ]
    }
];

async function seedCategories() {
    const client = await pool.connect();

    try {
        console.log('🌱 Starting categories seeding...\n');

        let totalCategories = 0;
        let totalSubcategories = 0;

        for (const category of categories) {
            console.log(`📁 Creating category: ${category.name}`);

            try {
                // Insert main category
                const catResult = await client.query(`
          INSERT INTO categories (name, slug, description, is_active, display_order)
          VALUES ($1, $2, $3, true, $4)
          ON CONFLICT (slug) DO UPDATE 
          SET name = EXCLUDED.name, description = EXCLUDED.description
          RETURNING id
        `, [category.name, category.slug, category.description, totalCategories]);

                const categoryId = catResult.rows[0].id;
                totalCategories++;
                console.log(`   ✓ Created (ID: ${categoryId})`);

                // Insert subcategories
                if (category.subcategories && category.subcategories.length > 0) {
                    console.log(`   📂 Adding ${category.subcategories.length} subcategories...`);

                    for (let i = 0; i < category.subcategories.length; i++) {
                        const sub = category.subcategories[i];

                        try {
                            await client.query(`
                INSERT INTO categories (name, slug, parent_id, description, is_active, display_order)
                VALUES ($1, $2, $3, $4, true, $5)
                ON CONFLICT (slug) DO UPDATE
                SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id
              `, [sub.name, sub.slug, categoryId, sub.description, i]);

                            totalSubcategories++;
                            console.log(`      ✓ ${sub.name}`);
                        } catch (subError: any) {
                            console.error(`      ❌ Error creating subcategory ${sub.name}: ${subError.message}`);
                        }
                    }
                }
            } catch (catError: any) {
                console.error(`   ❌ Error creating category: ${catError.message}`);
            }

            console.log('');
        }

        console.log('═'.repeat(60));
        console.log('✅ SEEDING COMPLETE!\n');
        console.log(`   📊 Categories created: ${totalCategories}`);
        console.log(`   📊 Subcategories created: ${totalSubcategories}`);
        console.log(`   📊 Total: ${totalCategories + totalSubcategories}`);
        console.log('═'.repeat(60));

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

seedCategories()
    .then(() => {
        console.log('\n✅ Categories seeder completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Seeder error:', error);
        process.exit(1);
    });
