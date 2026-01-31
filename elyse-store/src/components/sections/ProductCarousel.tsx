'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/types';
import styles from './ProductCarousel.module.css';

/**
 * Tabbed Product Carousel Section
 * Matches Rizabella's tabbed product showcase with smooth transitions
 */

interface Tab {
    id: string;
    label: string;
    products: Product[];
}

interface ProductCarouselProps {
    title: string;
    tabs: Tab[];
}

export function ProductCarousel({ title, tabs }: ProductCarouselProps) {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <section className="container-premium section-spacing">
            {/* Title */}
            <h2 className={styles.title}>{title}</h2>

            {/* Tabs */}
            <div className={styles.tabsWrapper}>
                {tabs.map((tab, index) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(index)}
                        className={`${styles.tab} ${index === activeTab ? styles.tabActive : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Product Grid with Animation */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className={styles.productGrid}
                >
                    {tabs[activeTab].products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.4,
                                delay: index * 0.08,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </section>
    );
}
