# Database Setup Guide

This guide explains how to set up the database for the Elyse e-commerce backend.

## Prerequisites

You need a PostgreSQL database. We recommend using **Supabase** for easy setup:

### Option 1: Supabase (Recommended - Free Tier)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to **Project Settings** → **Database**
4. Copy the **Connection string** (URI format)
5. Paste it as `DATABASE_URL` in your `.env.development` file

### Option 2: Local PostgreSQL

1. Install PostgreSQL 15+ on your machine
2. Create a database: `CREATE DATABASE elyse_dev;`
3. Set `DATABASE_URL=postgresql://username:password@localhost:5432/elyse_dev`

## Database Schema

The database includes the following tables:

**Core Tables:**
- `users` - User accounts and authentication
- `user_addresses` - Shipping and billing addresses
- `categories` - Product categories (hierarchical)
- `products` - Product catalog
- `product_variants` - Size/color variants with inventory
- `product_images` - Product images
- `tags` & `product_tags` - Product tagging system

**E-commerce Tables:**
- `collections` & `collection_products` - Product collections
- `carts` & `cart_items` - Shopping carts
- `orders` & `order_items` - Order management
- `product_reviews` - Customer reviews
- `wishlists` & `wishlist_items` - User wishlists

**Supporting Tables:**
- `coupons` & `coupon_usages` - Discount coupons
- `blog_posts` - Blog/content management
- `media` - Media library
- `settings` - Site configuration
- `audit_logs` - Admin action tracking

## Running Migrations

### 1. Configure Database Connection

Update `.env.development` with your database credentials:

```env
DATABASE_URL=postgresql://your-supabase-url-here
```

### 2. Run Migrations

Execute all pending migrations:

```bash
npm run migrate
```

This will:
- Create all tables
- Set up indexes
- Create triggers
- Insert default data (categories, settings, admin user)

### 3. Seed Sample Data (Optional)

Add sample products for development:

```bash
npm run seed
```

This creates:
- Sample products in different categories
- Product variants (sizes)
- Inventory data

### 4. Reset Database (Development Only)

To start fresh:

```bash
npm run db:reset
```

This runs migrations + seeding in one command.

## Migration Files

Migrations are executed in order:

1. `001_create_users_table.sql` - Users and addresses
2. `002_create_categories_table.sql` - Product categories
3. `003_create_products_tables.sql` - Products, variants, images, tags
4. `004_create_collections_tables.sql` - Collections
5. `005_create_carts_tables.sql` - Shopping carts
6. `006_create_orders_tables.sql` - Orders and order items
7. `007_create_reviews_and_wishlist_tables.sql` - Reviews and wishlists
8. `008_create_additional_tables.sql` - Coupons, blog, media, settings

## Default Data

After migrations, you'll have:

**Default Admin User:**
- Email: `admin@elyse.com`
- Password: `admin123` (⚠️ CHANGE THIS!)

**Default Categories:**
- Women, Men, Kids, Accessories, Sale

**Default Collections:**
- New Arrivals, Best Sellers, Summer Collection

**Default Settings:**
- Currency: INR
- Tax Rate: 18%
- Shipping Fee: ₹50
- Free Shipping Threshold: ₹1000

## Rollback Migration

To rollback the last migration (development only):

```bash
npm run migrate:rollback
```

⚠️ **Warning**: This only removes the migration from tracking. You may need to manually drop tables.

## Verifying Database

After running migrations, verify in Supabase:

1. Go to **Table Editor** in Supabase dashboard
2. You should see all tables listed
3. Check that default data exists (categories, settings, admin user)

## Troubleshooting

**Connection failed:**
```
Error: getaddrinfo ENOTFOUND
```
→ Check your DATABASE_URL is correct and includes password

**Permission denied:**
```
Error: permission denied for schema public
```
→ Ensure your database user has CREATE privileges

**Migration already exists:**
```
Error: duplicate key value violates unique constraint
```
→ Migration already ran successfully, this is normal

## Production Considerations

Before deploying to production:

1. **Change default admin password** immediately
2. **Use environment variables** for all credentials  
3. **Enable SSL** for database connections
4. **Set up automated backups** in Supabase
5. **Review and update** default settings
6. **Don't run seed** script in production

## Next Steps

After database setup:
1. Test the health endpoint: `http://localhost:3001/health`
2. Verify database shows "connected"
3. Proceed to Phase 3: Authentication API implementation
