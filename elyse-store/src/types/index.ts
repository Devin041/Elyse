export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    salePrice?: number;
    images: string[];
    category: string;
    tags: string[];
    variants: ProductVariant[];
    inStock: boolean;
    soldOut: boolean;
    featured?: boolean;
    newArrival?: boolean;
    badge?: string;
    careInstructions?: string;
    fabric?: string;
    color?: string;
    shippingInfo?: string;
    sale_price?: number;
    base_price?: number;
    category_name?: string;
}

export interface ProductVariant {
    id: string;
    sku: string;
    size?: string;
    color?: string;
    colorHex?: string;
    price?: number;
    sale_price?: number;
    inStock: boolean;
    inventory: number;
    inventoryCount?: number;
    images?: { url: string }[];
}

export interface CartItem {
    id: string;
    productId: string;
    productSlug: string;
    variantId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    variant: ProductVariant;
}

export interface Collection {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    products: Product[];
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    date: string;
    author?: string;
}

export interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

export interface FilterGroup {
    id: string;
    label: string;
    type: 'checkbox' | 'radio' | 'range' | 'color';
    options: FilterOption[];
    min?: number;
    max?: number;
}

export interface PriceRange {
    min: number;
    max: number;
}

export interface ActiveFilter {
    id: string;
    filterId: string;
    label: string;
    value: string;
    category: string;
}

export interface UserAddress {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    created_at?: string;
}

export interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    subtotal: number;
    tax_amount: number;
    shipping_cost: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    payment_method: string;
    created_at: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    product_name: string;
    variant_sku: string;
    quantity: number;
    price_at_purchase: number;
    image_url?: string;
}
