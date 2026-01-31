'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './OccasionCard.module.css';

/**
 * Category card for "Shop by Occasion" section  
 * Features 3:4 aspect ratio with image zoom on hover
 */

interface OccasionCardProps {
    title: string;
    image: string;
    href: string;
    index?: number; // For stagger animation
}

export function OccasionCard({ title, image, href, index = 0 }: OccasionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.4, 0, 0.2, 1],
            }}
        >
            <Link href={href} className={styles.card}>
                <div className={styles.imageWrapper}>
                    <img src={image} alt={title} className={styles.image} />
                    <div className={styles.overlay}>
                        <h3 className={styles.title}>{title}</h3>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
