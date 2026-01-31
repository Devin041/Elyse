import { z } from 'zod';

// Brand Story Schema
export const brandStorySchema = z.object({
    heading: z.string().min(1, "Heading is required").max(100, "Heading too long"),
    subheading: z.string().max(200, "Subheading too long").optional(),
    description: z.string().min(10, "Description must be at least 10 characters"),
    backgroundImageUrl: z.string().optional().or(z.literal("")),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
    alignment: z.enum(['left', 'center', 'right']),
    isEnabled: z.boolean(),
});

// Gift Cards Schema
export const giftCardsBannerSchema = z.object({
    title: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    ctaText: z.string().min(1, "Button text is required"),
    ctaLink: z.string().min(1, "Link is required"),
    backgroundImageUrl: z.string().optional().or(z.literal("")),
    overlayOpacity: z.number().min(0).max(100),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
    buttonColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
    buttonTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
    isEnabled: z.boolean(),
});

// Appointment CTA Schema
export const appointmentCTASchema = z.object({
    heading: z.string().optional().or(z.literal("")),
    subheading: z.string().optional().or(z.literal("")),
    ctaText: z.string().min(1, "Button text is required"),
    contactMethod: z.enum(['whatsapp', 'phone', 'email', 'link']),
    contactValue: z.string().min(1, "Contact value is required"),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional().or(z.literal("")),
    backgroundImageUrl: z.string().optional().or(z.literal("")),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional().or(z.literal("")),
    buttonColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional().or(z.literal("")),
    buttonTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional().or(z.literal("")),
    isEnabled: z.boolean(),
});

// Product Carousel Schema
export const productCarouselSchema = z.object({
    sectionTitle: z.string().min(1, "Section title is required"),
    tabs: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, "Tab name is required"),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
        productIds: z.array(z.number()).min(1, "Select at least one product"),
    })).min(1, "At least one tab is required"),
    autoplayInterval: z.number().min(0),
    showArrows: z.boolean(),
    showDots: z.boolean(),
    isEnabled: z.boolean(),
});

// Hero Section Schema
export const heroSectionSchema = z.object({
    title: z.string().optional().or(z.literal("")),
    titleStyle: z.enum(['outline', 'solid']),
    subtitle: z.string().optional().or(z.literal("")),
    backgroundType: z.enum(['gradient', 'image', 'video']),
    backgroundGradient: z.object({
        start: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
        end: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
    }).optional(),
    backgroundImageUrl: z.string().optional(),
    videoSettings: z.object({
        videoUrl: z.string().optional().or(z.literal("")),
        fallbackImageUrl: z.string().optional().or(z.literal("")),
        autoplay: z.boolean(),
        loop: z.boolean(),
        muted: z.boolean(),
        controls: z.boolean(),
    }).optional(),
    // Typography settings
    typography: z.object({
        title: z.object({
            fontFamily: z.string().optional(),
            fontSize: z.string().optional(),
            color: z.string().optional(),
            useGradient: z.boolean().optional(),
            gradient: z.object({
                start: z.string(),
                end: z.string()
            }).optional()
        }).optional(),
        subtitle: z.object({
            fontFamily: z.string().optional(),
            fontSize: z.string().optional(),
            color: z.string().optional()
        }).optional()
    }).optional(),
    leftImage: z.string().nullable().optional(),
    rightImages: z.array(z.string()).optional(),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    height: z.enum(['full', 'large', 'medium']),
    isEnabled: z.boolean(),
});


// Occasion Schema
export const occasionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    image: z.string().min(1, "Image is required"),
    link: z.string().min(1, "Link is required"),
    isEnabled: z.boolean(),
});

// Product Section Schema
export const productSectionSchema = z.object({
    sectionKey: z.string(),
    title: z.string().min(1, "Section title is required"),
    selectionType: z.enum(['auto', 'manual']),
    autoFilter: z.object({
        isFeatured: z.boolean().optional(),
        isNewArrival: z.boolean().optional(),
        limit: z.number().min(1),
    }),
    manualProductIds: z.array(z.number()),
    productsCount: z.number().min(1),
    columnsDesktop: z.number().min(1).max(6),
    columnsTablet: z.number().min(1).max(4),
    columnsMobile: z.number().min(1).max(2),
    isEnabled: z.boolean(),
});

// Blog Post Schema
export const blogPostSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title too long"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Invalid slug format"),
    excerpt: z.string().max(160, "Excerpt too long").optional(),
    content: z.string().min(1, "Content is required"),
    featuredImageUrl: z.string().optional(),
    authorName: z.string().min(1, "Author name is required"),
    metaTitle: z.string().max(60, "Meta title too long").optional(),
    metaDescription: z.string().max(160, "Meta description too long").optional(),
    isPublished: z.boolean(),
    isFeaturedHomepage: z.boolean(),
});

// Inquiry Schema
export const inquirySchema = z.object({
    name: z.string().min(1, "Full name is required").max(100, "Name too long"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(1, "Subject is required").max(100, "Subject too long"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});
