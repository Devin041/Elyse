'use client';

import Image from 'next/image';
import { motion, useScroll } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// --- Types ---
interface AboutUsConfig {
    hero: {
        type: 'video' | 'image';
        mediaUrl: string;
        heading: string;
        subheading: string;
    };
    origin: {
        image: string;
        heading: string;
        description: string;
    };
    founder: {
        image: string;
        name: string;
        quote: string;
    };
    process: {
        image: string;
    };
}

const DEFAULT_CONFIG: AboutUsConfig = {
    hero: {
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1610189012906-4783fdae2c26?q=80&w=2070&auto=format&fit=crop',
        heading: 'Where Heritage Meets Horizon',
        subheading: "Elysè isn't just a label; it's a love letter to the modern Indian woman who carries her roots with pride and her ambitions with grace."
    },
    origin: {
        image: 'https://images.unsplash.com/photo-1583391733956-6c78b7b8ca84?q=80&w=1200&auto=format&fit=crop',
        heading: 'Born from a Dream',
        description: "It started with a simple observation: the gap between traditional grandeur and contemporary comfort. We saw women adjusting their dreams to fit heavy lehengas. We asked, \"Why can't the outfit adjust to her?\"\n\nThus, Elysè was born—to craft silhouettes that flow as freely as your spirit. We blend the intricate embroidery of the past with the breathable, wearable cuts of the present."
    },
    founder: {
        image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=800&auto=format&fit=crop',
        name: 'Aditi, Founder of Elysè',
        quote: "I wanted to create clothes that make you feel like the protagonist of your own life—powerful, poised, and unequivocally beautiful."
    },
    process: {
        image: 'https://images.unsplash.com/photo-1583391733958-e02376e9ced3?q=80&w=1200&auto=format&fit=crop'
    }
};


function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

export function AboutContent() {
    const containerRef = useRef(null);
    const [config, setConfig] = useState<AboutUsConfig>(DEFAULT_CONFIG);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    useEffect(() => {
        async function fetchConfig() {
            try {
                const { data } = await supabase
                    .from('landing_page_settings')
                    .select('value')
                    .eq('key', 'about_us')
                    .maybeSingle();

                if (data?.value) {
                    // Deep merge or just spread (depending on guaranteed structure)
                    // For now, spread is safer if keys might be missing in older saved versions
                    setConfig(prev => ({
                        ...prev,
                        ...data.value,
                        hero: { ...prev.hero, ...(data.value.hero || {}) },
                        origin: { ...prev.origin, ...(data.value.origin || {}) },
                        founder: { ...prev.founder, ...(data.value.founder || {}) },
                        process: { ...prev.process, ...(data.value.process || {}) },
                    }));
                }
            } catch (error) {
                console.error("Failed to load about us content:", error);
            }
        }
        fetchConfig();
    }, []);

    // Helper to render description with line breaks
    const renderDescription = (text: string) => {
        return text.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mb-6 last:mb-0">
                {paragraph}
            </p>
        ));
    };

    return (
        <div className="bg-white" ref={containerRef}>
            {/* 1. Hero Section: Parallax & Immersion */}
            <div className="relative h-[90vh] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    {config.hero.type === 'video' ? (
                        <video
                            src={config.hero.mediaUrl}
                            muted
                            autoPlay
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Image
                            src={config.hero.mediaUrl}
                            alt="Elysè Hero"
                            fill
                            className="object-cover"
                            priority
                        />
                    )}
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
                    <motion.h1
                        key={config.hero.heading} // Re-animate on change
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-5xl md:text-7xl font-serif font-medium tracking-tight mb-6"
                    >
                        {config.hero.heading}
                    </motion.h1>
                    <motion.p
                        key={config.hero.subheading}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-lg md:text-xl font-light text-neutral-200 leading-relaxed max-w-2xl mx-auto"
                    >
                        {config.hero.subheading}
                    </motion.p>
                </div>
            </div>

            {/* 2. The Origin: Split Screen Story */}
            <section className="py-24 md:py-32 container-premium">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 relative aspect-[3/4] rounded-sm overflow-hidden bg-neutral-100">
                        <Image
                            src={config.origin.image}
                            alt="Design Sketches"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="order-1 lg:order-2 space-y-8">
                        <FadeIn>
                            <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase block mb-4">The Origin</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-6">{config.origin.heading}</h2>
                            <div className="space-y-6 text-neutral-600 font-light text-lg leading-relaxed">
                                {renderDescription(config.origin.description)}
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* 3. The Values: Trio Grid */}
            <section className="py-24 bg-neutral-50">
                <div className="container-premium">
                    <FadeIn>
                        <div className="text-center max-w-2xl mx-auto mb-20">
                            <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase block mb-4">Our Pillars</span>
                            <h2 className="text-3xl md:text-4xl font-serif text-neutral-900">Why We Exist</h2>
                        </div>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                title: "Conscious Luxury",
                                desc: "We believe true luxury shouldn't cost the earth. Our fabrics are ethically sourced, and our processes minimize waste.",
                                icon: "🌿"
                            },
                            {
                                title: "Timeless Artistry",
                                desc: "Trends fade; style remains. We design heirlooms intended to be passed down, not discarded after a season.",
                                icon: "✨"
                            },
                            {
                                title: "Modern Muses",
                                desc: "Our cuts are designed for movement. Dance, drive, lead—Elysè moves with you, never holding you back.",
                                icon: "💃"
                            }
                        ].map((item, idx) => (
                            <FadeIn key={idx} delay={idx * 0.2}>
                                <div className="text-center p-8 bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                                    <span className="text-4xl mb-6 block">{item.icon}</span>
                                    <h3 className="text-xl font-serif text-neutral-900 mb-4">{item.title}</h3>
                                    <p className="text-neutral-600 font-light leading-relaxed">{item.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. The Process: Full Width Visual */}
            <section className="relative py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1620799140408-ed5341cd2431?q=80&w=2000&auto=format&fit=crop"
                        alt="Artisan Texture"
                        fill
                        className="object-cover opacity-10"
                    />
                </div>
                <div className="container-premium relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <FadeIn>
                                <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase block mb-4">The Process</span>
                                <h2 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-6">From Sketch to Stitch</h2>
                                <p className="text-neutral-600 font-light text-lg leading-relaxed mb-6">
                                    Every Elysè garment passes through 40 pairs of hands. It begins in the sketchbook of our Mumbai studio, travels to the looms of Banaras, breathes under the needle of Lucknowi artisans, and finds its final form in our quality atelier.
                                </p>
                                <p className="text-neutral-600 font-light text-lg leading-relaxed">
                                    It represents a journey of thousands of miles, stitched into a single masterpiece.
                                </p>
                            </FadeIn>
                        </div>
                        <div className="relative aspect-video rounded-sm overflow-hidden shadow-2xl">
                            <Image
                                src={config.process.image}
                                alt="Artisans at work"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Founder's Note */}
            <section className="py-24 md:py-32 container-premium border-t border-neutral-100">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="w-48 h-48 md:w-64 md:h-64 relative flex-shrink-0">
                        <div className="absolute inset-0 rounded-full border border-neutral-200 m-2" />
                        <Image
                            src={config.founder.image}
                            alt="Aditi, Founder"
                            fill
                            className="object-cover rounded-full"
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <FadeIn>
                            <h3 className="text-2xl font-serif text-neutral-900 mb-6">A Note from the Founder</h3>
                            <blockquote className="text-xl md:text-2xl font-serif italic text-neutral-600 leading-relaxed mb-8">
                                &quot;{config.founder.quote}&quot;
                            </blockquote>
                            <div className="font-serif text-lg text-neutral-900">
                                — {config.founder.name}
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>
        </div>
    );
}
