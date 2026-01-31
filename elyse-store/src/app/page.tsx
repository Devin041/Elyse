import { HeroSection } from '@/components/sections/HeroSection';
import { OccasionCard } from '@/components/cards/OccasionCard';
import { ProductCard } from '@/components/product/ProductCard';
import { BlogCard } from '@/components/cards/BlogCard';
import { AppointmentCTA } from '@/components/sections/AppointmentCTA';
import { GiftCardBanner } from '@/components/sections/GiftCardBanner';
import { ProductCarousel } from '@/components/sections/ProductCarousel';
import {
  heroSections,
  occasionCategories,
  brandStory,
  bestSellers,
  blogSection,
  appointmentCTA,
  giftCardsBanner,
} from '@/data/homepageData';
import { createClient } from '@supabase/supabase-js';
import { HeroGrid } from '@/components/sections/HeroGrid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API_URL}/products?isFeatured=true&limit=8`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    return [];
  }
}

async function getNewArrivals() {
  try {
    const res = await fetch(`${API_URL}/products?isNewArrival=true&limit=8`, {
      next: { revalidate: 60 }
    });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch new arrivals:', error);
    return [];
  }
}

async function getBlogPosts() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: sample } = await supabase.from('blog_posts').select('*').limit(1).maybeSingle();
    const availableColumns = sample ? Object.keys(sample) : [];

    let query = supabase.from('blog_posts').select('*');

    // Resilient Published Filtering
    if (availableColumns.includes('is_published')) {
      query = query.eq('is_published', true);
    } else if (availableColumns.includes('status')) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(3);

    if (error) throw error;

    return data.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      image: post.featured_image || post.featured_image_url || post.image_url || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400",
      date: new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      author: post.author_name || 'Elyse Team'
    }));
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
}

async function getLandingPageSettings() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('landing_page_settings')
      .select('*');

    if (error) throw error;

    return data?.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {}) || {};
  } catch (error) {
    console.error('Failed to fetch landing page settings:', error);
    return {};
  }
}

async function getAppointmentCTA() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: cta, error } = await supabase
      .from('appointment_cta')
      .select('*')
      .single();

    if (error) return null;

    let ctaLink = '';
    const method = cta.config?.contactMethod;
    if (method === 'whatsapp') {
      ctaLink = `https://wa.me/${cta.whatsapp_number}`;
    } else if (method === 'phone') {
      ctaLink = `tel:${cta.phone_number}`;
    } else if (method === 'email') {
      ctaLink = `mailto:${cta.config?.email}`;
    } else if (method === 'link') {
      ctaLink = cta.config?.link;
    }

    return {
      label: '',
      title: cta.title, // Match DB column name
      subtitle: cta.description, // Match DB column name
      ctaText: cta.cta_text,
      ctaLink, // Use the dynamically constructed link
      backgroundImage: cta.config?.backgroundImageUrl,
      backgroundColor: cta.config?.backgroundColor,
      textColor: cta.config?.textColor,
      buttonColor: cta.config?.buttonColor,
      buttonTextColor: cta.config?.buttonTextColor,
      isEnabled: cta.is_enabled
    };
  } catch (error) {
    console.error('Failed to fetch appointment CTA:', error);
    return null;
  }
}

async function getHeroSections() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('hero_sections')
      .select('*')
      .eq('is_enabled', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch hero sections:', error);
    return [];
  }
}

async function getGiftCardsBanner() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: banner, error } = await supabase
      .from('gift_cards_banner')
      .select('*')
      .single();

    if (error) return null;

    return {
      logo: 'Elysè',
      mainText: banner.title,
      subtitle: banner.description,
      link: banner.cta_link,
      ctaText: banner.cta_text,
      backgroundImage: banner.background_image_url,
      overlayOpacity: banner.overlay_opacity,
      textColor: banner.text_color,
      buttonColor: banner.button_bg_color,
      buttonTextColor: banner.button_text_color,
      isEnabled: banner.is_enabled
    };
  } catch (error) {
    console.error('Failed to fetch gift cards banner:', error);
    return null;
  }
}

export default async function HomePage() {
  const [featuredProducts, newArrivals, settings, heroSectionsData, realPosts, realCTA, realGiftBanner] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getLandingPageSettings(),
    getHeroSections(),
    getBlogPosts(),
    getAppointmentCTA(),
    getGiftCardsBanner()
  ]);

  const displayPosts = realPosts.length > 0 ? realPosts : blogSection.posts;
  const sectionTitle = blogSection.title;
  const displayCTA = realCTA || appointmentCTA;
  const displayGiftBanner = realGiftBanner || {
    ...giftCardsBanner,
    logo: 'Elysè',
    isEnabled: true // Ensure isEnabled exists for fallback
  };

  // Use dynamic shop styles if available, else fallback to hardcoded
  const shopByStyle = settings.shop_by_style && settings.shop_by_style.length > 0
    ? settings.shop_by_style.map((cat: any) => ({
      title: cat.customLabel || cat.name,
      slug: cat.slug,
      image: cat.image_url || `/occasions/${cat.slug}.png`,
      href: `/collections/${cat.slug}`
    }))
    : occasionCategories;

  const heroGridConfig = settings.hero_grid || [];

  // Create a combined pool of unique products for homepage sections
  // This ensures that even if featuredProducts are sparse, we always have 8 items for the grids
  const combinedPool = [...featuredProducts];
  newArrivals.forEach((p: any) => {
    if (!combinedPool.find(fp => fp.id === p.id)) {
      combinedPool.push(p);
    }
  });

  const bestSellerProducts = combinedPool.slice(0, 8);

  // Fetch tabbed products
  const [cocktailProducts, weddingProducts] = await Promise.all([
    fetch(`${API_URL}/products?tag=cocktail&limit=4`).then(res => res.json()).then(data => data.success ? data.data : []),
    fetch(`${API_URL}/products?tag=wedding&limit=4`).then(res => res.json()).then(data => data.success ? data.data : []),
  ]);

  // Tabbed products for carousel
  const carouselTabs = [
    {
      id: 'cocktail',
      label: 'COCKTAIL CHARM 🥂',
      products: cocktailProducts.length > 0 ? cocktailProducts : newArrivals.slice(0, 4),
    },
    {
      id: 'wedding',
      label: 'WEDDING DAY ELEGANCE ❤️',
      products: weddingProducts.length > 0 ? weddingProducts : featuredProducts.slice(0, 4),
    },
  ];

  // Map dynamic heroes
  const dynamicHeroes = heroSectionsData.map((hero: any) => ({
    id: hero.id,
    title: hero.title || '',
    subtitle: hero.subtitle || '',
    background: hero.background_type === 'gradient'
      ? `linear-gradient(135deg, ${hero.config?.backgroundGradient?.start || '#FFD700'} 0%, ${hero.config?.backgroundGradient?.end || '#FFA500'} 100%)`
      : 'transparent',
    titleStyle: hero.config?.titleStyle || 'outline',
    ctaText: hero.cta_text,
    ctaLink: hero.cta_link,
    images: {
      left: hero.config?.leftImage,
      right: hero.config?.rightImages
    },
    height: hero.config?.height || 'full',
    backgroundType: hero.background_type,
    videoSettings: hero.config?.videoSettings,
    typography: hero.config?.typography
  }));
  // Fallback if no dynamic heroes
  const hero1 = dynamicHeroes.length > 0 ? dynamicHeroes[0] : heroSections.hero1;
  const hero2 = dynamicHeroes.length > 1 ? dynamicHeroes[1] : heroSections.hero2;

  return (
    <div className="homepage">
      {/* Hero Section 1 - Top */}
      <HeroSection {...hero1} />

      {/* Shop by Occasion Section */}
      <section className="container-premium section-spacing">
        <h2 className="text-center text-3xl font-semibold mb-12 tracking-wide">
          SHOP BY OCCASION
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shopByStyle.map((category: any, index: number) => (
            <OccasionCard
              key={category.slug}
              title={category.title}
              image={category.image}
              href={category.href}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Handpicked Styles */}
      <section className="container-premium section-spacing">
        <h2 className="text-center text-3xl font-semibold mb-12 tracking-wide">
          HANDPICKED STYLES WE LOVE!
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestSellerProducts.slice(4, 8).map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Hero Section 2 - Middle (only if exists) */}
      {dynamicHeroes.length > 1 ? (
        <HeroSection {...dynamicHeroes[1]} />
      ) : dynamicHeroes.length === 0 ? (
        <HeroSection {...heroSections.hero2} />
      ) : null}


      {/* Product Carousel with Tabs */}
      <ProductCarousel title="ELYSÈ FESTIVE WEAR" tabs={carouselTabs} />

      {/* Brand Story Section */}
      <section className="container-premium section-spacing">
        <div className="text-center" style={{ maxWidth: brandStory.maxWidth, margin: '0 auto' }}>
          <h2 className="text-2xl font-serif italic mb-6">{brandStory.logo}</h2>
          <p className="text-lg leading-relaxed text-neutral-700">
            {brandStory.tagline}
          </p>
        </div>
      </section>

      {/* Dynamic Hero Grid */}
      {heroGridConfig && (Array.isArray(heroGridConfig) ? heroGridConfig.length > 0 : heroGridConfig.items?.length > 0) ? (
        <HeroGrid config={Array.isArray(heroGridConfig) ? { items: heroGridConfig } : heroGridConfig} />
      ) : (
        <section className="container-premium section-spacing">
          <h2 className="text-center text-3xl font-semibold mb-12 tracking-wide">
            {bestSellers.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellerProducts.slice(0, 4).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Gift Cards Banner */}
      {displayGiftBanner && displayGiftBanner.isEnabled !== false && (
        <GiftCardBanner {...displayGiftBanner} />
      )}

      {/* Appointment CTA */}
      {displayCTA && <AppointmentCTA {...displayCTA} />}

      <section className="container-premium section-spacing pb-20">
        <h2 className="text-center text-3xl font-semibold mb-12 tracking-wide">
          {sectionTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayPosts.map((post: any, index: number) => (
            <BlogCard key={post.id} {...post} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
