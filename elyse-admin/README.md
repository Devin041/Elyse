# Elyse Admin Panel - Quick Start Guide

## Access
- **URL:** [http://localhost:3002](http://localhost:3002)
- **Login:** `admin@elyse.com`
- **Password:** `admin123`

## Features Built
1.  **Secure Authentication:**
    - JWT-based login.
    - Protected routes (redirects to login if not auth).
    - Auto-logout on token expiry.

2.  **Product Management:**
    - **List View:** See all products with images, prices, and status.
    - **Create Product:** Form to add new products (Name, Price, SKU, etc.).
    - **Delete Product:** Remove products from the catalog.

3.  **Dashboard UI:**
    - Clean, responsive sidebar layout.
    - User profile display.
    - Tailwind CSS styling matching the main store.

## Architecture
- **Framework:** Next.js 15 (App Router)
- **Port:** 3002 (to avoid conflict with Store on 3000)
- **API:** Connects to `http://localhost:3001/api/v1`

## Next Steps
- [ ] Add "Edit Product" page.
- [ ] Add "Image Upload" (currently using URL inputs).
- [ ] Add "Order Management" view.
