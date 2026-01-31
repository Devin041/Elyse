import type { Product, FilterGroup } from '@/types';

export const products: Product[] = [
    {
        id: '1',
        name: 'Draped Skirt Cape Set - Rust Red',
        slug: 'draped-skirt-cape-set-rust-red',
        description: '<p>Striking Two-Piece Ensemble. Turn heads in this stylish two-piece set featuring a cropped blouse and a draped, asymmetrical skirt. Elegant, cape-like sleeves add beautiful movement to the design.</p>',
        price: 22499,
        images: [
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1583391733958-e02376e9ced3?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Cape Set',
        tags: ['festive', 'red', 'cape'],
        variants: [
            { id: 'v1', size: 'S', sku: 'DSCS-RR-S', inStock: true, inventory: 5 },
            { id: 'v2', size: 'M', sku: 'DSCS-RR-M', inStock: true, inventory: 3 },
            { id: 'v3', size: 'L', sku: 'DSCS-RR-L', inStock: false, inventory: 0 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Chinnon & Crepe',
        color: 'Rust Red',
        badge: 'New'
    },
    {
        id: '2',
        name: 'Handwork Cape & Blouse With Drape Skirt - Crimson Red',
        slug: 'handwork-cape-blouse-drape-skirt-crimson-red',
        description: '<p>Beautiful crimson red set with intricate handwork.</p>',
        price: 14999,
        images: [
            'https://images.unsplash.com/photo-1610189012906-4783fdae2c26?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Cape Set',
        tags: ['festive', 'red'],
        variants: [
            { id: 'v4', size: 'S', sku: 'HCB-CR-S', inStock: true, inventory: 10 },
            { id: 'v5', size: 'M', sku: 'HCB-CR-M', inStock: true, inventory: 8 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Georgette',
        color: 'Crimson Red'
    },
    {
        id: '3',
        name: 'Embroidered Jacket Palazzo Set - Ivory',
        slug: 'embroidered-jacket-palazzo-set-ivory',
        description: '<p>Elegant ivory set with detailed embroidery.</p>',
        price: 13199,
        images: [
            'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1545959788-217725445215?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Jacket Set',
        tags: ['festive', 'ivory'],
        variants: [
            { id: 'v6', size: 'S', sku: 'EJPS-IV-S', inStock: false, inventory: 0 },
        ],
        inStock: false,
        soldOut: true,
        fabric: 'Silk',
        color: 'Ivory',
        badge: 'Sold Out'
    },
    {
        id: '4',
        name: 'Mint Blossom Co-ord Set',
        slug: 'mint-blossom-co-ord-set',
        description: '<p>Fresh mint co-ord set perfect for summer festivities.</p>',
        price: 4999,
        images: [
            'https://images.unsplash.com/photo-1585988076790-442271884d4b?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1610189012906-4783fdae2c26?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Co-ord Set',
        tags: ['casual', 'mint'],
        variants: [
            { id: 'v7', size: 'S', sku: 'MBCS-M-S', inStock: true, inventory: 15 },
            { id: 'v8', size: 'M', sku: 'MBCS-M-M', inStock: true, inventory: 12 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Cotton',
        color: 'Mint Green'
    },
    {
        id: '5',
        name: 'Royal Blue Anarkali Set',
        slug: 'royal-blue-anarkali-set',
        description: '<p>Stunning royal blue anarkali with gold embroidery.</p>',
        price: 18999,
        images: [
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Anarkali',
        tags: ['festive', 'blue', 'handpicked'],
        variants: [
            { id: 'v9', size: 'S', sku: 'RBAS-S', inStock: true, inventory: 5 },
            { id: 'v10', size: 'M', sku: 'RBAS-M', inStock: true, inventory: 3 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Silk',
        color: 'Royal Blue',
        badge: 'Trending'
    },
    {
        id: '6',
        name: 'Emerald Green Sharara Set',
        slug: 'emerald-green-sharara-set',
        description: '<p>Vibrant green sharara set for festive occasions.</p>',
        price: 15499,
        images: [
            'https://images.unsplash.com/photo-1610189012906-4783fdae2c26?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1610189012906-4783fdae2c26?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Sharara Set',
        tags: ['festive', 'green', 'handpicked'],
        variants: [
            { id: 'v11', size: 'S', sku: 'EGSS-S', inStock: true, inventory: 8 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Georgette',
        color: 'Emerald Green'
    },
    {
        id: '7',
        name: 'Blush Pink Lehenga',
        slug: 'blush-pink-lehenga',
        description: '<p>Soft pink lehenga with delicate floral embroidery.</p>',
        price: 28999,
        images: [
            'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Lehenga',
        tags: ['wedding', 'pink', 'handpicked'],
        variants: [
            { id: 'v12', size: 'M', sku: 'BPL-M', inStock: true, inventory: 2 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Net',
        color: 'Blush Pink',
        badge: 'Bestseller'
    },
    {
        id: '8',
        name: 'Golden Tissue Saree',
        slug: 'golden-tissue-saree',
        description: '<p>Classic golden tissue saree for a regal look.</p>',
        price: 12999,
        images: [
            'https://images.unsplash.com/photo-1610189012908-3269f2b7b2d0?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1610189012908-3269f2b7b2d0?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Saree',
        tags: ['festive', 'gold', 'handpicked'],
        variants: [
            { id: 'v13', size: 'Free', sku: 'GTS-F', inStock: true, inventory: 10 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Tissue',
        color: 'Gold',
        newArrival: false
    },
    // Products 9-48 for New In collection
    {
        id: '9',
        name: 'Black Indulgence Ensemble',
        slug: 'black-indulgence-ensemble',
        description: '<p>Elegant black ensemble with intricate detailing.</p>',
        price: 23999,
        images: [
            'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Cape Set',
        tags: ['festive', 'black'],
        variants: [
            { id: 'v14', size: 'S', sku: 'BIE-S', inStock: true, inventory: 5 },
            { id: 'v15', size: 'M', sku: 'BIE-M', inStock: true, inventory: 3 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Velvet',
        color: 'Black',
        newArrival: true,
        badge: 'New'
    },
    {
        id: '10',
        name: '2 PC Draped Saree - Sky Blue',
        slug: '2-pc-draped-saree-sky-blue',
        description: '<p>Pre-draped saree in sky blue.</p>',
        price: 17999,
        images: [
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Saree',
        tags: ['festive', 'blue'],
        variants: [
            { id: 'v16', size: 'Free', sku: '2PDS-SB-F', inStock: true, inventory: 8 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Georgette',
        color: 'Sky Blue',
        newArrival: true
    },
    {
        id: '11',
        name: '2 PC Draped Saree - Peach',
        slug: '2-pc-draped-saree-peach',
        description: '<p>Pre-draped saree in peach color.</p>',
        price: 17999,
        images: [
            'https://images.unsplash.com/photo-1610189012906-4783fdae2c26?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Saree',
        tags: ['festive', 'pink'],
        variants: [
            { id: 'v17', size: 'Free', sku: '2PDS-P-F', inStock: false, inventory: 0 },
        ],
        inStock: false,
        soldOut: true,
        fabric: 'Georgette',
        color: 'Peach',
        newArrival: true,
        badge: 'Sold Out'
    },
    {
        id: '12',
        name: '3 PCS Jacket Set with White Moti Handwork',
        slug: '3-pcs-jacket-set-white-moti',
        description: '<p>Three piece jacket set with pearl handwork.</p>',
        price: 30999,
        images: [
            'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Jacket Set',
        tags: ['wedding', 'white'],
        variants: [
            { id: 'v18', size: 'S', sku: '3PJS-WM-S', inStock: true, inventory: 2 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Silk',
        color: 'White',
        newArrival: true
    },
    {
        id: '13',
        name: 'Rose Garden Hand-Embroidered Ensemble',
        slug: 'rose-garden-ensemble',
        description: '<p>Delicate rose garden embroidery.</p>',
        price: 11999,
        images: [
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Co-ord Set',
        tags: ['festive', 'pink'],
        variants: [
            { id: 'v19', size: 'M', sku: 'RGE-M', inStock: true, inventory: 10 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Cotton',
        color: 'Pink',
        newArrival: true
    },
    {
        id: '14',
        name: '3 PCS Short Kurti Dupatta - Olive Green',
        slug: '3-pcs-short-kurti-olive',
        description: '<p>Short kurti set in olive green.</p>',
        price: 14499,
        images: [
            'https://images.unsplash.com/photo-1585988076790-442271884d4b?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Kurti Set',
        tags: ['casual', 'green'],
        variants: [
            { id: 'v20', size: 'M', sku: '3PSK-OG-M', inStock: true, inventory: 15 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Rayon',
        color: 'Olive Green',
        newArrival: true
    },
    {
        id: '15',
        name: '3 PCS Short Kurti Dupatta - Grey',
        slug: '3-pcs-short-kurti-grey',
        description: '<p>Short kurti set in grey.</p>',
        price: 10499,
        images: [
            'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Kurti Set',
        tags: ['casual', 'grey'],
        variants: [
            { id: 'v21', size: 'L', sku: '3PSK-G-L', inStock: true, inventory: 12 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Rayon',
        color: 'Grey',
        newArrival: true
    },
    {
        id: '16',
        name: 'Kaftan Set - Lime Green',
        slug: 'kaftan-set-lime-green',
        description: '<p>Comfortable kaftan set.</p>',
        price: 5999,
        images: [
            'https://images.unsplash.com/photo-1583391733958-e02376e9ced3?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Kaftan',
        tags: ['casual', 'green'],
        variants: [
            { id: 'v22', size: 'Free', sku: 'KS-LG-F', inStock: true, inventory: 20 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Cotton',
        color: 'Lime Green',
        newArrival: true
    },
    {
        id: '17',
        name: 'Kaftan Set - Yellow',
        slug: 'kaftan-set-yellow',
        description: '<p>Bright yellow kaftan.</p>',
        price: 5999,
        images: [
            'https://images.unsplash.com/photo-1545959788-217725445215?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Kaftan',
        tags: ['casual', 'yellow'],
        variants: [
            { id: 'v23', size: 'Free', sku: 'KS-Y-F', inStock: true, inventory: 18 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Cotton',
        color: 'Yellow',
        newArrival: true
    },
    {
        id: '18',
        name: 'Metallic Embroidered Cape Palazzo Set',
        slug: 'metallic-embroidered-cape-palazzo',
        description: '<p>Metallic embroidery cape set.</p>',
        price: 18299,
        images: [
            'https://images.unsplash.com/photo-1610189012908-3269f2b7b2d0?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Cape Set',
        tags: ['festive', 'beige'],
        variants: [
            { id: 'v24', size: 'S', sku: 'MECP-S', inStock: true, inventory: 4 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Georgette',
        color: 'Beige',
        newArrival: true
    },
    {
        id: '19',
        name: 'Embroidered Blouse With Cape & Drape Skirt',
        slug: 'embroidered-blouse-cape-drape-skirt',
        description: '<p>Complete ensemble with cape and drape skirt.</p>',
        price: 24999,
        images: [
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Cape Set',
        tags: ['festive', 'black'],
        variants: [
            { id: 'v25', size: 'M', sku: 'EBCS-M', inStock: true, inventory: 6 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Silk',
        color: 'Black',
        newArrival: true
    },
    {
        id: '20',
        name: 'Powder Pink Sharara Set',
        slug: 'powder-pink-sharara-set',
        description: '<p>Soft powder pink sharara.</p>',
        price: 16999,
        images: [
            'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Sharara Set',
        tags: ['wedding', 'pink'],
        variants: [
            { id: 'v26', size: 'M', sku: 'PPSS-M', inStock: true, inventory: 5 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Georgette',
        color: 'Powder Pink',
        newArrival: true
    },
    {
        id: '21',
        name: 'Maroon Velvet Lehenga',
        slug: 'maroon-velvet-lehenga',
        description: '<p>Rich maroon velvet lehenga.</p>',
        price: 32999,
        images: [
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Lehenga',
        tags: ['wedding', 'maroon'],
        variants: [
            { id: 'v27', size: 'S', sku: 'MVL-S', inStock: true, inventory: 3 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Velvet',
        color: 'Maroon',
        newArrival: true
    },
    {
        id: '22',
        name: 'Navy Blue Anarkali',
        slug: 'navy-blue-anarkali',
        description: '<p>Navy anarkali with gold details.</p>',
        price: 19999,
        images: [
            'https://images.unsplash.com/photo-1610189012906-4783fdae2c26?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Anarkali',
        tags: ['festive', 'blue'],
        variants: [
            { id: 'v28', size: 'L', sku: 'NBA-L', inStock: true, inventory: 7 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Silk',
        color: 'Navy Blue',
        newArrival: true
    },
    {
        id: '23',
        name: 'Mint Green Co-ord Set',
        slug: 'mint-green-coord-set',
        description: '<p>Fresh mint green coord.</p>',
        price: 7999,
        images: [
            'https://images.unsplash.com/photo-1585988076790-442271884d4b?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Co-ord Set',
        tags: ['casual', 'green'],
        variants: [
            { id: 'v29', size: 'M', sku: 'MGCS-M', inStock: true, inventory: 12 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Cotton',
        color: 'Mint Green',
        newArrival: true
    },
    {
        id: '24',
        name: 'Ivory Jacket Palazzo Set',
        slug: 'ivory-jacket-palazzo-set',
        description: '<p>Classic ivory jacket set.</p>',
        price: 14999,
        images: [
            'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Jacket Set',
        tags: ['wedding', 'ivory'],
        variants: [
            { id: 'v30', size: 'S', sku: 'IJPS-S', inStock: true, inventory: 6 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Silk',
        color: 'Ivory',
        newArrival: true
    },
    // Continue with products 25-48
    {
        id: '25',
        name: 'Teal Green Sharara',
        slug: 'teal-green-sharara',
        description: '<p>Beautiful teal sharara.</p>',
        price: 15999,
        images: [
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Sharara Set',
        tags: ['festive', 'green'],
        variants: [
            { id: 'v31', size: 'M', sku: 'TGS-M', inStock: true, inventory: 8 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Georgette',
        color: 'Teal',
        newArrival: true
    },
    {
        id: '26',
        name: 'Burgundy Lehenga Set',
        slug: 'burgundy-lehenga-set',
        description: '<p>Rich burgundy lehenga.</p>',
        price: 29999,
        images: [
            'https://images.unsplash.com/photo-1610189012908-3269f2b7b2d0?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Lehenga',
        tags: ['wedding', 'burgundy'],
        variants: [
            { id: 'v32', size: 'S', sku: 'BLS-S', inStock: true, inventory: 4 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Net',
        color: 'Burgundy',
        newArrival: true
    },
    {
        id: '27',
        name: 'Coral Pink Anarkali',
        slug: 'coral-pink-anarkali',
        description: '<p>Vibrant coral anarkali.</p>',
        price: 17999,
        images: [
            'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Anarkali',
        tags: ['festive', 'pink'],
        variants: [
            { id: 'v33', size: 'M', sku: 'CPA-M', inStock: true, inventory: 9 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Georgette',
        color: 'Coral Pink',
        newArrival: true
    },
    {
        id: '28',
        name: 'White Chicken Kurti Set',
        slug: 'white-chicken-kurti-set',
        description: '<p>White chikankari kurti.</p>',
        price: 8999,
        images: [
            'https://images.unsplash.com/photo-1583391733958-e02376e9ced3?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Kurti Set',
        tags: ['casual', 'white'],
        variants: [
            { id: 'v34', size: 'L', sku: 'WCKS-L', inStock: true, inventory: 11 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Cotton',
        color: 'White',
        newArrival: true
    },
    {
        id: '29',
        name: 'Mustard Yellow Coord',
        slug: 'mustard-yellow-coord',
        description: '<p>Bright mustard coord set.</p>',
        price: 6999,
        images: [
            'https://images.unsplash.com/photo-1545959788-217725445215?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Co-ord Set',
        tags: ['casual', 'yellow'],
        variants: [
            { id: 'v35', size: 'S', sku: 'MYC-S', inStock: true, inventory: 14 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Linen',
        color: 'Mustard Yellow',
        newArrival: true
    },
    {
        id: '30',
        name: 'Purple Silk Saree',
        slug: 'purple-silk-saree',
        description: '<p>Elegant purple silk saree.</p>',
        price: 13999,
        images: [
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Saree',
        tags: ['festive', 'purple'],
        variants: [
            { id: 'v36', size: 'Free', sku: 'PSS-F', inStock: true, inventory: 10 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Silk',
        color: 'Purple',
        newArrival: true
    },
    {
        id: '31',
        name: 'Sage Green Sharara',
        slug: 'sage-green-sharara',
        description: '<p>Soft sage green sharara.</p>',
        price: 16499,
        images: [
            'https://images.unsplash.com/photo-1610189012906-4783fdae2c26?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Sharara Set',
        tags: ['festive', 'green'],
        variants: [
            { id: 'v37', size: 'M', sku: 'SGS-M', inStock: true, inventory: 7 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Georgette',
        color: 'Sage Green',
        newArrival: true
    },
    {
        id: '32',
        name: 'Charcoal Grey Lehenga',
        slug: 'charcoal-grey-lehenga',
        description: '<p>Modern charcoal lehenga.</p>',
        price: 27999,
        images: [
            'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Lehenga',
        tags: ['wedding', 'grey'],
        variants: [
            { id: 'v38', size: 'S', sku: 'CGL-S', inStock: true, inventory: 5 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Net',
        color: 'Charcoal Grey',
        newArrival: true
    },
    {
        id: '33',
        name: 'Lavender Anarkali Set',
        slug: 'lavend-anarkali-set',
        description: '<p>Delicate lavender anarkali.</p>',
        price: 18499,
        images: [
            'https://images.unsplash.com/photo-1585988076790-442271884d4b?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Anarkali',
        tags: ['festive', 'purple'],
        variants: [
            { id: 'v39', size: 'M', sku: 'LAS-M', inStock: true, inventory: 8 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Georgette',
        color: 'Lavender',
        newArrival: true
    },
    {
        id: '34',
        name: 'Cream Cape Suit',
        slug: 'cream-cape-suit',
        description: '<p>Elegant cream cape suit.</p>',
        price: 21999,
        images: [
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Cape Set',
        tags: ['wedding', 'cream'],
        variants: [
            { id: 'v40', size: 'L', sku: 'CCS-L', inStock: true, inventory: 6 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Silk',
        color: 'Cream',
        newArrival: true
    },
    {
        id: '35',
        name: 'Turquoise Kurti Palazzo',
        slug: 'turquoise-kurti-palazzo',
        description: '<p>Bright turquoise set.</p>',
        price: 9999,
        images: [
            'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Kurti Set',
        tags: ['casual', 'blue'],
        variants: [
            { id: 'v41', size: 'M', sku: 'TKP-M', inStock: true, inventory: 12 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Rayon',
        color: 'Turquoise',
        newArrival: true
    },
    {
        id: '36',
        name: 'Rose Pink Sharara',
        slug: 'rose-pink-sharara',
        description: '<p>Beautiful rose pink sharara.</p>',
        price: 17499,
        images: [
            'https://images.unsplash.com/photo-1610189012908-3269f2b7b2d0?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Sharara Set',
        tags: ['wedding', 'pink'],
        variants: [
            { id: 'v42', size: 'S', sku: 'RPS-S', inStock: true, inventory: 4 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Georgette',
        color: 'Rose Pink',
        newArrival: true
    },
    {
        id: '37',
        name: 'Wine Red Lehenga',
        slug: 'wine-red-lehenga',
        description: '<p>Rich wine color lehenga.</p>',
        price: 31999,
        images: [
            'https://images.unsplash.com/photo-1583391733958-e02376e9ced3?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Lehenga',
        tags: ['wedding', 'red'],
        variants: [
            { id: 'v43', size: 'M', sku: 'WRL-M', inStock: true, inventory: 3 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Velvet',
        color: 'Wine Red',
        newArrival: true
    },
    {
        id: '38',
        name: 'Aqua Blue Coord Set',
        slug: 'aqua-blue-coord-set',
        description: '<p>Fresh aqua coord set.</p>',
        price: 7499,
        images: [
            'https://images.unsplash.com/photo-1545959788-217725445215?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Co-ord Set',
        tags: ['casual', 'blue'],
        variants: [
            { id: 'v44', size: 'L', sku: 'ACS-L', inStock: true, inventory: 10 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Cotton',
        color: 'Aqua Blue',
        newArrival: true
    },
    {
        id: '39',
        name: 'Champagne Gold Saree',
        slug: 'champagne-gold-saree',
        description: '<p>Shimmer champagne saree.</p>',
        price: 14999,
        images: [
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Saree',
        tags: ['festive', 'gold'],
        variants: [
            { id: 'v45', size: 'Free', sku: 'CGS-F', inStock: true, inventory: 9 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Silk',
        color: 'Champagne',
        newArrival: true
    },
    {
        id: '40',
        name: 'Olive Green Anarkali',
        slug: 'olive-green-anarkali',
        description: '<p>Elegant olive anarkali.</p>',
        price: 19499,
        images: [
            'https://images.unsplash.com/photo-1610189012906-4783fdae2c26?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Anarkali',
        tags: ['festive', 'green'],
        variants: [
            { id: 'v46', size: 'M', sku: 'OGA-M', inStock: true, inventory: 7 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Georgette',
        color: 'Olive Green',
        newArrival: true
    },
    {
        id: '41',
        name: 'Peach Jacket Set',
        slug: 'peach-jacket-set',
        description: '<p>Soft peach jacket set.</p>',
        price: 13999,
        images: [
            'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Jacket Set',
        tags: ['wedding', 'peach'],
        variants: [
            { id: 'v47', size: 'S', sku: 'PJS-S', inStock: true, inventory: 6 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Silk',
        color: 'Peach',
        newArrival: true
    },
    {
        id: '42',
        name: 'Fuchsia Pink Sharara',
        slug: 'fuchsia-pink-sharara',
        description: '<p>Vibrant fuchsia sharara.</p>',
        price: 18999,
        images: [
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Sharara Set',
        tags: ['festive', 'pink'],
        variants: [
            { id: 'v48', size: 'M', sku: 'FPS-M', inStock: true, inventory: 5 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Georgette',
        color: 'Fuchsia',
        newArrival: true
    },
    {
        id: '43',
        name: 'Steel Grey Lehenga',
        slug: 'steel-grey-lehenga',
        description: '<p>Modern steel grey lehenga.</p>',
        price: 26999,
        images: [
            'https://images.unsplash.com/photo-1585988076790-442271884d4b?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Lehenga',
        tags: ['wedding', 'grey'],
        variants: [
            { id: 'v49', size: 'S', sku: 'SGL-S', inStock: true, inventory: 4 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Net',
        color: 'Steel Grey',
        newArrival: true
    },
    {
        id: '44',
        name: 'Lemon Yellow Kurti',
        slug: 'lemon-yellow-kurti',
        description: '<p>Bright lemon kurti set.</p>',
        price: 8499,
        images: [
            'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Kurti Set',
        tags: ['casual', 'yellow'],
        variants: [
            { id: 'v50', size: 'M', sku: 'LYK-M', inStock: true, inventory: 11 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Cotton',
        color: 'Lemon Yellow',
        newArrival: true
    },
    {
        id: '45',
        name: 'Tangerine Orange Coord',
        slug: 'tangerine-orange-coord',
        description: '<p>Vibrant orange coord set.</p>',
        price: 7999,
        images: [
            'https://images.unsplash.com/photo-1610189012908-3269f2b7b2d0?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Co-ord Set',
        tags: ['casual', 'orange'],
        variants: [
            { id: 'v51', size: 'L', sku: 'TOC-L', inStock: true, inventory: 9 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Linen',
        color: 'Tangerine',
        newArrival: true
    },
    {
        id: '46',
        name: 'Copper Orange Anarkali',
        slug: 'copper-orange-anarkali',
        description: '<p>Rich copper anarkali.</p>',
        price: 20999,
        images: [
            'https://images.unsplash.com/photo-1583391733958-e02376e9ced3?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Anarkali',
        tags: ['festive', 'orange'],
        variants: [
            { id: 'v52', size: 'S', sku: 'COA-S', inStock: true, inventory: 6 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Silk',
        color: 'Copper',
        newArrival: true
    },
    {
        id: '47',
        name: 'Ash Grey Saree',
        slug: 'ash-grey-saree',
        description: '<p>Subtle ash grey saree.</p>',
        price: 12499,
        images: [
            'https://images.unsplash.com/photo-1545959788-217725445215?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Saree',
        tags: ['festive', 'grey'],
        variants: [
            { id: 'v53', size: 'Free', sku: 'AGS-F', inStock: true, inventory: 8 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Georgette',
        color: 'Ash Grey',
        newArrival: true
    },
    {
        id: '48',
        name: 'Magenta Sharara Set',
        slug: 'magenta-sharara-set',
        description: '<p>Bold magenta sharara set.</p>',
        price: 19999,
        images: [
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'Sharara Set',
        tags: ['festive', 'pink'],
        variants: [
            { id: 'v54', size: 'M', sku: 'MSS-M', inStock: true, inventory: 5 },
        ],
        inStock: true,
        soldOut: false,
        fabric: 'Georgette',
        color: 'Magenta',
        newArrival: true
    }
];

export const trendingSearches = [
    'Red Cape Sets',
    'Festive Collection',
    'Ivory Ensembles',
    'Bestsellers',
    'New Arrivals',
    'Co-ord Sets',
];

export const filters: FilterGroup[] = [
    {
        id: 'category',
        label: 'Category',
        type: 'checkbox',
        options: [
            { value: 'cape-set', label: 'Cape Set' },
            { value: 'jacket-set', label: 'Jacket Set' },
            { value: 'co-ord-set', label: 'Co-ord Set' },
            { value: 'anarkali', label: 'Anarkali' },
        ],
    },
    {
        id: 'color',
        label: 'Color',
        type: 'checkbox',
        options: [
            { value: 'red', label: 'Red' },
            { value: 'blue', label: 'Blue' },
            { value: 'green', label: 'Green' },
            { value: 'ivory', label: 'Ivory' },
            { value: 'black', label: 'Black' },
        ],
    },
    {
        id: 'size',
        label: 'Size',
        type: 'checkbox',
        options: [
            { value: 'xs', label: 'XS' },
            { value: 's', label: 'S' },
            { value: 'm', label: 'M' },
            { value: 'l', label: 'L' },
            { value: 'xl', label: 'XL' },
            { value: 'xxl', label: 'XXL' },
        ],
    },
    {
        id: 'price',
        label: 'Price Range',
        type: 'range',
        options: [],
        min: 0,
        max: 30000,
    },
];
