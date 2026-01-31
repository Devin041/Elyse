# Products API - Testing Guide

## Base URL
```
http://localhost:3001/api/v1/products
```

## Public Endpoints (No Authentication Required)

### 1. Get All Products (with filters)
**GET** `/products`

Query Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `categoryId` - Filter by category UUID
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `search` - Search in name/description
- `isFeatured` - Filter featured products (true/false)
- `isNewArrival` - Filter new arrivals (true/false)
- `inStock` - Only show in-stock items (true/false)
- `sortBy` - Sort ( price_asc, price_desc, name_asc, name_desc, newest, popular)

**Examples:**
```bash
# Get all products
curl http://localhost:3001/api/v1/products

# Get page 2 with 10 items per page
curl "http://localhost:3001/api/v1/products?page=2&limit=10"

# Search for "shirt"
curl "http://localhost:3001/api/v1/products?search=shirt"

# Get products between ₹1000 and ₹3000
curl "http://localhost:3001/api/v1/products?minPrice=1000&maxPrice=3000"

# Get featured products sorted by price (low to high)
curl "http://localhost:3001/api/v1/products?isFeatured=true&sortBy=price_asc"

# Get only in-stock items
curl "http://localhost:3001/api/v1/products?inStock=true"
```

### 2. Get Single Product
**GET** `/products/:slug`

```bash
curl http://localhost:3001/api/v1/products/classic-white-shirt
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Classic White Shirt",
    "slug": "classic-white-shirt",
    "description": "Timeless white cotton shirt...",
    "base_price": 1299,
    "sale_price": 999,
    "category_name": "Women",
    "category_slug": "women",
    "fabric": "100% Cotton",
    "care_instructions": "Machine wash cold",
    "is_featured": true,
    "is_new_arrival": true,
    "badge": "Sale",
    "images": [
      {
        "id": "uuid",
        "url": "https://...",
        "altText": "Classic white shirt front view",
        "isPrimary": true
      }
    ],
    "variants": [
      {
        "id": "uuid",
        "sku": "WOM-SH-001-S",
        "size": "S",
        "inventoryCount": 25
      }
    ],
    "tags": ["cotton", "casual", "basic"]
  }
}
```

### 3. Get Featured Products
**GET** `/products/featured?limit=8`

```bash
curl http://localhost:3001/api/v1/products/featured
```

### 4. Get New Arrivals
**GET** `/products/new-arrivals?limit=8`

```bash
curl http://localhost:3001/api/v1/products/new-arrivals
```

## Admin-Only Endpoints (Require Authentication + Admin Role)

### 5. Create Product
**POST** `/products`

Headers:
```
Authorization: Bearer {admin_access_token}
Content-Type: application/json
```

Body:
```json
{
  "name": "Silk Evening Dress",
  "slug": "silk-evening-dress",
  "description": "Elegant silk dress for special occasions",
  "basePrice": 4999,
  "salePrice": 3999,
  "categoryId": "uuid-of-women-category",
  "sku": "WOM-DR-002",
  "fabric": "100% Silk",
  "careInstructions": "Dry clean only",
  "isFeatured": true,
  "isNewArrival": true,
  "badge": "New",
  "metaTitle": "Silk Evening Dress - Elyse",
  "metaDescription": "Shop our elegant silk evening dress"
}
```

```bash
curl -X POST http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Silk Evening Dress",
    "slug": "silk-evening-dress",
    "description": "Elegant silk dress",
    "basePrice": 4999,
    "categoryId": "category-uuid"
  }'
```

### 6. Update Product
**PUT** `/products/:id`

```bash
curl -X PUT http://localhost:3001/api/v1/products/product-uuid \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salePrice": 3499,
    "isFeatured": true
  }'
```

### 7. Delete Product (Soft Delete)
**DELETE** `/products/:id`

```bash
curl -X DELETE http://localhost:3001/api/v1/products/product-uuid \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 8. Add Product Variant
**POST** `/products/:id/variants`

```bash
curl -X POST http://localhost:3001/api/v1/products/product-uuid/variants \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "WOM-DR-002-M",
    "size": "M",
    "color": "Red",
    "colorHex": "#FF0000",
    "inventoryCount": 15
  }'
```

### 9. Update Variant Inventory
**PATCH** `/products/variants/:variantId/inventory`

```bash
curl -X PATCH http://localhost:3001/api/v1/products/variants/variant-uuid/inventory \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inventoryCount": 50}'
```

### 10. Add Product Image
**POST** `/products/:id/images`

```bash
curl -X POST http://localhost:3001/api/v1/products/product-uuid/images \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/images/product.jpg",
    "altText": "Product image",
    "displayOrder": 1,
    "isPrimary": true
  }'
```

## Testing Workflow

### 1. Browse Products (No Auth)
```bash
# Get all products
curl http://localhost:3001/api/v1/products

# Search
curl "http://localhost:3001/api/v1/products?search=shirt"

# View product details
curl http://localhost:3001/api/v1/products/classic-white-shirt
```

### 2. Admin Operations (Requires Admin Login)

First, login as admin:
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elyse.com","password":"admin123"}'
```

Save the `accessToken` from response, then:

```bash
# Create a product
curl -X POST http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @new-product.json

# Update inventory
curl -X PATCH http://localhost:3001/api/v1/products/variants/VARIANT_ID/inventory \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inventoryCount": 100}'
```

## Features Demonstrated

✅ **Public Browsing**
- Anyone can view products
- Advanced filtering and search
- Pagination support
- Featured products & new arrivals

✅ **Admin Management**
- Create/update/delete products
- Manage variants and inventory
- Add product images
- Role-based access control

✅ **Performance**
- Full-text search on PostgreSQL
- Efficient queries with joins
- Pagination to limit data transfer

✅ **Security**
- Public endpoints open (read-only)
- Admin endpoints protected
- Request validation (Zod)
- SQL injection protection

## Sample Data Available

The seeded database includes:
1. Classic White Shirt (Women's) - ₹999 (on sale)
2. Floral Summer Dress (Women's) - ₹2,499
3. Denim Jacket (Women's) - ₹2,799 (on sale)
4. Oxford Button-Down Shirt (Men's) - ₹1,499
5. Slim Fit Chinos (Men's) - ₹1,599 (on sale)

All with size variants (S, M, L, XL) and inventory.

## Next: Frontend Integration

Use these APIs in your Next.js frontend:

```typescript
// Fetch products
const response = await fetch('http://localhost:3001/api/v1/products');
const { data, pagination } = await response.json();

// Get product details
const product = await fetch(`http://localhost:3001/api/v1/products/${slug}`);

// Search
const results = await fetch(`http://localhost:3001/api/v1/products?search=${query}`);
```
