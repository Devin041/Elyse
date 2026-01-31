/**
 * Homepage Data Structure
 * Centralized content for all Rizabella-inspired homepage sections
 */

// ========================================
// HERO SECTIONS
// ========================================

export const heroSections = {
    hero1: {
        id: 'hero-yellow',
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        title: 'पोली',
        titleStyle: 'outline' as const,
        subtitle: 'Bella Edit: For the bridesmaid who brings the glam to the wedding!',
        images: {
            left: '/heroes/yellow-left.png',
            right: '/heroes/yellow-right.png',
        },
        height: 'full' as const,
    },
    hero2: {
        id: 'hero-gradient',
        background: 'linear-gradient(135deg, #B91C31 0%, #E86C3B 50%, #F5A623 100%)',
        title: 'मेंदी',
        titleStyle: 'outline' as const,
        subtitle: 'Bella Edit: For the bridesmaid who brings the glam to the wedding!',
        ctaText: 'SHOP NOW',
        ctaLink: '/collections/mehendi',
        images: {
            left: '/heroes/gradient-left.png',
            right: [
                'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1610189012908-3269f2b7b2d0?q=80&w=600&auto=format&fit=crop',
            ],
        },
        height: 'large' as const,
    },
};

// ========================================
// SHOP BY OCCASION
// ========================================

export const occasionCategories = [
    {
        title: 'MEHENDI',
        slug: 'mehendi',
        image: '/occasions/mehendi.png',
        href: '/collections/mehendi',
    },
    {
        title: 'COCKTAILS',
        slug: 'cocktails',
        image: '/occasions/cocktails.png',
        href: '/collections/cocktails',
    },
    {
        title: 'SANGEET',
        slug: 'sangeet',
        image: '/occasions/sangeet.png',
        href: '/collections/sangeet',
    },
    {
        title: 'WEDDING',
        slug: 'wedding',
        image: '/occasions/wedding.png',
        href: '/collections/wedding',
    },
];

// ========================================
// BRAND STORY
// ========================================

export const brandStory = {
    logo: 'Elysè',
    tagline:
        'Every stitch in our world is a whisper of ambition. Every drape, a story of passion. Every creation, a promise that dreams are not meant to stay in the heart—they are meant to be lived.',
    maxWidth: '900px',
};

// ========================================
// BEST SELLERS
// ========================================

export const bestSellers = {
    title: 'BEST SELLERS',
    productIds: ['1', '2', '3', '4', '5', '6', '7', '8'],
};

// ========================================
// GIFT CARDS BANNER
// ========================================

export const giftCardsBanner = {
    logo: 'Elysè',
    mainText: 'Gift of Love',
    subtitle: 'GIFT CARDS',
    link: '/products/gift-card',
};

// ========================================
// APPOINTMENT CTA
// ========================================

export const appointmentCTA = {
    label: 'TALK TO US',
    title: 'Book an Appointment',
    subtitle: 'Visit us or book an online appointment',
    ctaText: 'BOOK AN APPOINTMENT',
    ctaLink: '/appointment',
    backgroundImage:
        'https://images.unsplash.com/photo-1583391733956-6c78b7b8ca84?q=80&w=1600&auto=format&fit=crop',
};

// ========================================
// BLOG SECTION
// ========================================

export const blogSection = {
    title: 'GOOD READS',
    posts: [
        {
            id: '1',
            slug: 'cool-contemporary-blue-cord-set',
            title: 'Cool & Contemporary: Spotlight on the Blue Cord Set',
            image:
                'https://images.unsplash.com/photo-1610189012906-4783fdae2c26?q=80&w=800&auto=format&fit=crop',
            date: 'November 20, 2024',
            author: 'Elyse Team',
        },
        {
            id: '2',
            slug: 'bold-statements-cape-palazzo',
            title: 'Bold Statements: Spotlight on Embroidered Sets',
            image:
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
            date: 'November 18, 2024',
            author: 'Elyse Team',
        },
        {
            id: '3',
            slug: 'effortless-elegance',
            title: 'Effortless Elegance: How to Style Your Festive Outfit',
            image:
                'https://images.unsplash.com/photo-1583391733958-e02376e9ced3?q=80&w=800&auto=format&fit=crop',
            date: 'November 15, 2024',
            author: 'Elyse Team',
        },
    ],
};
