# Shopping Cart API - Complete Testing Guide

## Base URL
```
http://localhost:3001/api/v1/cart
```

## Features

✅ **Guest Cart** - Works without authentication using session cookies  
✅ **User Cart** - Persisted cart for logged-in users  
✅ **Auto-merge** - Guest cart automatically merges on login  
✅ **Inventory Validation** - Prevents adding more than available stock  
✅ **Smart Totals** - Auto-calculates subtotal, tax (18% GST), shipping  
✅ **Free Shipping** - Orders over ₹1000 get free shipping  

## API Endpoints

### 1. Get Cart
**GET** `/cart`

**Access:** Public (works for both guest and authenticated users)

```bash
# Get cart (guest user - creates session automatically)
curl http://localhost:3001/api/v1/cart

# Get cart (authenticated user)
curl http://localhost:3001/api/v1/cart \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cart-uuid",
    "items": [
      {
        "id": "cart-item-uuid",
        "productId": "product-uuid",
        "productName": "Classic White Shirt",
        "productSlug": "classic-white-shirt",
        "variantId": "variant-uuid",
        "variantSku": "WOM-SH-001-M",
        "size": "M",
        "color": null,
        "price": 999,
        "quantity": 2,
        "imageUrl": "https://...",
        "inventoryCount": 25
      }
    ],
    "itemCount": 2,
    "subtotal": 1998,
    "tax": 359.64,
    "shipping": 0,
    "total": 2357.64
  }
}
```

### 2. Add Item to Cart
**POST** `/cart/items`

**Access:** Public

**Body:**
```json
{
  "productId": "product-uuid",
  "variantId": "variant-uuid",
  "quantity": 1
}
```

```bash
curl -X POST http://localhost:3001/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_UUID_HERE",
    "variantId": "VARIANT_UUID_HERE",
    "quantity": 2
  }'
```

### 3. Update Cart Item Quantity
**PUT** `/cart/items/:id`

**Access:** Public

**Body:**
```json
{
  "quantity": 3
}
```

```bash
# Update quantity
curl -X PUT http://localhost:3001/api/v1/cart/items/CART_ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'

# Set quantity to 0 to remove item
curl -X PUT http://localhost:3001/api/v1/cart/items/CART_ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{"quantity": 0}'
```

### 4. Remove Item from Cart
**DELETE** `/cart/items/:id`

**Access:** Public

```bash
curl -X DELETE http://localhost:3001/api/v1/cart/items/CART_ITEM_ID
```

### 5. Clear Entire Cart
**DELETE** `/cart`

**Access:** Public

```bash
curl -X DELETE http://localhost:3001/api/v1/cart
```

### 6. Merge Guest Cart (After Login)
**POST** `/cart/merge`

**Access:** Private (requires authentication)

```bash
curl -X POST http://localhost:3001/api/v1/cart/merge \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Complete Testing Workflow

### Test 1: Guest User Shopping Flow

```bash
# Step 1: Get empty cart (creates session)
curl http://localhost:3001/api/v1/cart -c cookies.txt

# Step 2: Get product IDs from products API first
curl http://localhost:3001/api/v1/products

# Step 3: Add item to cart (use actual UUIDs from step 2)
curl -X POST http://localhost:3001/api/v1/cart/items \
  -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "YOUR_PRODUCT_ID",
    "variantId": "YOUR_VARIANT_ID",
    "quantity": 2
  }'

# Step 4: View updated cart
curl http://localhost:3001/api/v1/cart -b cookies.txt

# Step 5: Update quantity
curl -X PUT http://localhost:3001/api/v1/cart/items/CART_ITEM_ID \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'

# Step 6: Remove item
curl -X DELETE http://localhost:3001/api/v1/cart/items/CART_ITEM_ID \
  -b cookies.txt
```

### Test 2: Authenticated User Flow

```bash
# Step 1: Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@elyse.com","password":"Test123!"}' \
  | jq -r '.data.tokens.accessToken' > token.txt

TOKEN=$(cat token.txt)

# Step 2: Add items to cart
curl -X POST http://localhost:3001/api/v1/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "variantId": "VARIANT_ID",
    "quantity": 1
  }'

# Step 3: View cart
curl http://localhost:3001/api/v1/cart \
  -H "Authorization: Bearer $TOKEN"

# Step 4: Clear cart
curl -X DELETE http://localhost:3001/api/v1/cart \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3: Guest to User Cart Merge

```bash
# Step 1: Add items as guest
curl -X POST http://localhost:3001/api/v1/cart/items \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "variantId": "VARIANT_ID",
    "quantity": 2
  }'

# Step 2: Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"test@elyse.com","password":"Test123!"}' \
  > auth_response.json

TOKEN=$(cat auth_response.json | jq -r '.data.tokens.accessToken')

# Step 3: Merge guest cart into user cart
curl -X POST http://localhost:3001/api/v1/cart/merge \
  -b cookies.txt \
  -H "Authorization: Bearer $TOKEN"

# Step 4: View merged cart
curl http://localhost:3001/api/v1/cart \
  -H "Authorization: Bearer $TOKEN"
```

## Easy Testing (Using Product Slugs)

### Get Product & Variant IDs

```bash
# Get a product
curl http://localhost:3001/api/v1/products/classic-white-shirt | jq

# From the response, copy:
# - Product ID (.data.id)
# - Variant ID (.data.variants[0].id) for desired size
```

### Quick Add to Cart Example

```javascript
// Using the classic white shirt (seeded product)
const product = await fetch('http://localhost:3001/api/v1/products/classic-white-shirt')
  .then(r => r.json());

const productId = product.data.id;
const variantId = product.data.variants.find(v => v.size === 'M').id;

// Add to cart
await fetch('http://localhost:3001/api/v1/cart/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId,
    variantId,
    quantity: 1
  })
});
```

## Validation & Error Handling

**Stock Validation:**
```bash
# Try adding more than available stock
curl -X POST http://localhost:3001/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "variantId": "VARIANT_ID",
    "quantity": 9999
  }'

# Response:
{
  "success": false,
  "message": "Only 25 items available in stock"
}
```

**Invalid Product:**
```bash
curl -X POST http://localhost:3001/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "00000000-0000-0000-0000-000000000000",
    "variantId": "00000000-0000-0000-0000-000000000000",
    "quantity": 1
  }'

# Response:
{
  "success": false,
  "message": "Product or variant not found"
}
```

## Features in Action

### Automatic Tax Calculation (18% GST)
- Subtotal: ₹1000
- Tax (18%): ₹180  
- Total: ₹1180

### Free Shipping Threshold
- Order < ₹1000: ₹50 shipping fee
- Order ≥ ₹1000: ₹0 shipping (FREE!)

### Session Management
- Guest users get automatic session ID cookie
- Session lasts 7 days
- Cart persists across browser sessions

### Cart Expiration
- Guest carts expire after 7 days
- User carts expire after 30 days
- Automatic cleanup prevents database bloat

## Next Steps: Frontend Integration

```typescript
// In your Next.js app
import { useCart } from '@/hooks/useCart';

function ProductPage() {
  const { addToCart, cart } = useCart();
  
  const handleAddToCart = async (productId, variantId) => {
    await fetch('http://localhost:3001/api/v1/cart/items', {
      method: 'POST',
      credentials: 'include', // Important for cookies!
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // if logged in
      },
      body: JSON.stringify({
        productId,
        variantId,
        quantity: 1
      })
    });
  };
}
```

## Pro Tips

1. **Use cookies.txt with curl** - Maintains session across requests
2. **Check inventory before adding** - Prevents validation errors
3. **Merge cart after login** - Better UX for users
4. **Clear cart after order** - Reset for next purchase

Ready to test! 🛒
