'use client';

import Image from 'next/image';
import styles from './CollectionHero.module.css';

interface CollectionHeroProps {
    title: string;
    description?: string;
    image: string;
}

/**
 * Rizabella-style collection hero banner
 * Full-width image with centered text overlay
 */
export function CollectionHero({ title, description, image }: CollectionHeroProps) {
    return (
        <div className={styles.hero}>
            <div className={styles.imageContainer}>
                <Image
                    src={image}
                    alt={title}
                    fill
                    className={styles.image}
                    sizes="100vw"
                    priority
                />
            </div>
            <div className={styles.overlay}>
                <div className={styles.content}>
                    <h1 className={styles.title}>{title}</h1>
                    {description && <p className={styles.description}>{description}</p>}
                </div>
            </div>
        </div>
    );
}
