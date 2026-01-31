'use client';

import { clsx } from 'clsx';
import Image from 'next/image';
import styles from './HeroSection.module.css';

/**
 * Reusable full-width hero banner component
 * Supports split image layouts with responsive behavior
 */

// ... imports

interface TypographySettings {
    title?: {
        fontFamily?: string;
        fontSize?: string;
        color?: string;
        useGradient?: boolean;
        gradient?: {
            start: string;
            end: string;
        };
    };
    subtitle?: {
        fontFamily?: string;
        fontSize?: string;
        color?: string;
    };
}

interface HeroSectionProps {
    id: string;
    background: string; // CSS gradient or solid color
    title?: string;
    titleStyle?: 'outline' | 'solid';
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    images: HeroImage;
    height?: 'full' | 'large' | 'medium';
    backgroundType?: 'gradient' | 'image' | 'video';
    videoSettings?: VideoSettings;
    typography?: TypographySettings;
}


export function HeroSection({
    id,
    background,
    title,
    titleStyle = 'outline',
    subtitle,
    ctaText,
    ctaLink,
    images,
    height = 'full',
    backgroundType = 'image',
    videoSettings,
    typography,
}: HeroSectionProps) {
    const titleStyleConfig = typography?.title;
    const subtitleStyleConfig = typography?.subtitle;

    const titleStyles = {
        fontFamily: titleStyleConfig?.fontFamily ? `'${titleStyleConfig.fontFamily}', sans-serif` : undefined,
        fontSize: titleStyleConfig?.fontSize || undefined,
        color: titleStyleConfig?.useGradient ? 'transparent' : (titleStyleConfig?.color || undefined),
        backgroundImage: titleStyleConfig?.useGradient
            ? `linear-gradient(to right, ${titleStyleConfig.gradient?.start}, ${titleStyleConfig.gradient?.end})`
            : undefined,
        WebkitBackgroundClip: titleStyleConfig?.useGradient ? 'text' : undefined,
        backgroundClip: titleStyleConfig?.useGradient ? 'text' : undefined,
    };

    const subtitleStyles = {
        fontFamily: subtitleStyleConfig?.fontFamily ? `'${subtitleStyleConfig.fontFamily}', sans-serif` : undefined,
        fontSize: subtitleStyleConfig?.fontSize || undefined,
        color: subtitleStyleConfig?.color || undefined,
    };

    return (

        <section
            id={id}
            className={clsx(styles.hero, styles[height])}
            style={{
                background: (backgroundType === 'gradient') ? background : undefined,
                backgroundColor: 'transparent' // Explicitly clear for video/image
            }}
        >

            {backgroundType === 'video' && videoSettings?.videoUrl && (
                <div className={styles.videoBackground}>
                    <video
                        src={videoSettings.videoUrl}
                        poster={videoSettings.fallbackImageUrl}
                        autoPlay={videoSettings.autoplay}
                        loop={videoSettings.loop}
                        muted={videoSettings.muted}
                        controls={videoSettings.controls}
                        playsInline
                        className={styles.videoElement}
                    />
                    <div className={styles.videoOverlay} />
                </div>
            )}

            {backgroundType === 'image' && images.left && (
                <div className={styles.imageBackground}>
                    <Image
                        src={images.left}
                        alt="Background"
                        fill
                        priority
                        className={styles.imageElement}
                        sizes="100vw"
                    />
                    <div className={styles.imageOverlay} />
                </div>
            )}


            <div className={clsx(
                styles.heroContent,
                backgroundType !== 'gradient' && styles.fullBackgroundContent
            )}>
                {/* Left Image - Only for legacy/gradient split layout */}
                {backgroundType === 'gradient' && images.left && (

                    <div className={styles.heroImageSingle}>
                        <Image
                            src={images.left}
                            alt="Hero fashion"
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                            sizes="(max-width: 768px) 100vw, 40vw"
                        />
                    </div>
                )}


                {/* Center Text Content */}
                <div className={styles.heroText}>
                    {title && (
                        <h1
                            className={clsx(
                                styles.heroTitle,
                                titleStyle === 'outline' && !titleStyleConfig?.useGradient ? styles.titleOutline : styles.titleSolid
                            )}
                            style={titleStyles}
                        >
                            {title}
                        </h1>
                    )}
                    {subtitle && (
                        <p
                            className={styles.heroSubtitle}
                            style={subtitleStyles}
                        >
                            {subtitle}
                        </p>
                    )}


                    {ctaText && ctaLink && (
                        <a href={ctaLink} className={styles.heroCta}>
                            {ctaText}
                        </a>
                    )}
                </div>

                {/* Right Image(s) - Only for legacy/gradient split layout */}
                {backgroundType === 'gradient' && images.right && (

                    <>
                        {Array.isArray(images.right) ? (
                            <div className={styles.heroImageStack}>
                                {images.right.map((img, index) => (
                                    <div key={index} className={styles.stackedImage}>
                                        <Image
                                            src={img}
                                            alt={`Hero fashion ${index + 1}`}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            priority={index === 0}
                                            sizes="(max-width: 768px) 100vw, 35vw"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.heroImageSingle}>
                                <Image
                                    src={images.right}
                                    alt="Hero fashion"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    priority
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

