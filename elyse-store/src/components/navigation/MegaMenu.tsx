'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import styles from './MegaMenu.module.css';
import { megaMenuData } from '@/data/megaMenuData';
import { supabase } from '@/lib/supabase';

/**
 * MegaMenu component – renders the "Shop by Style" mega menu.
 * Full-width dropdown with sidebar categories + visual cards, matching Rizabella's design.
 * Dynamically fetches configuration from 'landing_page_settings'.
 */
export function MegaMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();


    // State for dynamic content
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        async function fetchMenuData() {
            try {
                // Fetch settings and categories in parallel
                const [settingsRes, categoriesRes] = await Promise.all([
                    supabase.from('landing_page_settings').select('*').eq('key', 'mega_menu').maybeSingle(),
                    supabase.from('categories').select('name, slug')
                ]);

                // Map Category Slugs to Full objects
                const categoriesMap = new Map(categoriesRes.data?.map((c: any) => [c.slug, c]) || []);

                if (settingsRes.data?.value) {
                    const savedConfig = settingsRes.data.value;

                    // Reconstruct sidebar items with real names
                    const expandedCategories = (savedConfig.sidebarCategories || [])
                        .map((slug: string) => {
                            const found = categoriesMap.get(slug);
                            return found ? { label: found.name, href: `/collections/${found.slug}`, slug: found.slug } : null;
                        })
                        .filter(Boolean);

                    setConfig({
                        categories: expandedCategories.length > 0 ? expandedCategories : megaMenuData.categories,
                        visualCards: savedConfig.visualCards?.length > 0 ? savedConfig.visualCards.map((c: any) => ({
                            title: c.title,
                            image: c.image || 'https://images.unsplash.com/photo-1610652492079-8f5b90e29a94?q=80&w=600&h=800&auto=format&fit=crop', // Fallback
                            href: c.link
                        })) : megaMenuData.visualCards
                    });
                }
            } catch (err) {
                console.error("Failed to fetch mega menu config:", err);
            }
        }

        fetchMenuData();
    }, []); // Removed dependency on supabase instance to prevent re-runs

    // Use dynamic config or fallback to static data
    const activeData = config || megaMenuData;

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    // Keyboard accessibility
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    return (
        <div
            className={styles.megaMenuWrapper}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Trigger - styled like other nav links */}
            <span
                className={clsx(
                    'text-sm font-medium leading-6 transition-colors hover:text-neutral-600 cursor-pointer',
                    pathname === '/collections/all' ? 'text-neutral-900' : 'text-neutral-500'
                )}
            >
                Shop by Style
            </span>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop with fade */}
                        <motion.div
                            className={styles.megaMenuOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu Content - Slide down + fade like Rizabella */}
                        <motion.div
                            className={styles.megaMenuContent}
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{
                                duration: 0.4,
                                ease: [0.4, 0, 0.2, 1] // Custom cubic-bezier for smooth motion
                            }}
                        >
                            {/* Inner Grid Container */}
                            <div className={styles.megaMenuInner}>
                                {/* Left Sidebar - Fade in with delay */}
                                <motion.nav
                                    className={styles.sidebar}
                                    aria-label="Shop by Style categories"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                                >
                                    <ul>
                                        {activeData.categories.map((cat: any, index: number) => (
                                            <motion.li
                                                key={cat.slug}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: 0.15 + (index * 0.03),
                                                    ease: 'easeOut'
                                                }}
                                            >
                                                <a href={cat.href} className={styles.sidebarLink}>
                                                    {cat.label}
                                                </a>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.nav>

                                {/* Right Visual Cards - Staggered fade + scale */}
                                <section className={styles.cardsGrid} aria-label="Featured collections">
                                    {activeData.visualCards.map((card: any, index: number) => (
                                        <motion.a
                                            href={card.href}
                                            key={card.title}
                                            className={styles.card}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: 0.15 + (index * 0.08),
                                                ease: [0.4, 0, 0.2, 1]
                                            }}
                                        >
                                            <div className={styles.cardImageWrapper}>
                                                <img src={card.image} alt={card.title} className={styles.cardImage} loading="lazy" />
                                                <div className={styles.cardOverlay}>
                                                    <h3 className={styles.cardTitle}>{card.title}</h3>
                                                </div>
                                            </div>
                                        </motion.a>
                                    ))}
                                </section>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
