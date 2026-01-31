'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './BlogCard.module.css';

/**
 * Blog post preview card for "Good Reads" section
 * Features 4:3 aspect ratio with date, title, and author
 */

interface BlogCardProps {
    id: string;
    slug: string;
    title: string;
    image: string;
    date: string;
    author: string;
    index?: number; // For stagger animation
}

export function BlogCard({ slug, title, image, date, author, index = 0 }: BlogCardProps) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1],
            }}
        >
            <Link href={`/blog/${slug}`} className={styles.card}>
                <div className={styles.imageWrapper}>
                    <img src={image} alt={title} className={styles.image} />
                </div>

                <div className={styles.content}>
                    <time className={styles.date}>{date}</time>
                    <h3 className={styles.title}>{title}</h3>
                    <p className={styles.author}>By {author}</p>
                </div>
            </Link>
        </motion.article>
    );
}
