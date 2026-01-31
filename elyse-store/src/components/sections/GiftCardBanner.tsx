'use client';

import Link from 'next/link';
import styles from './GiftCardBanner.module.css';

interface GiftCardBannerProps {
    logo?: string;
    mainText?: string;
    subtitle?: string;
    link: string;
    ctaText?: string;
    backgroundImage?: string;
    overlayOpacity?: number;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
}

export function GiftCardBanner({
    logo,
    mainText,
    subtitle,
    link,
    ctaText = 'Buy Gift Card',
    backgroundImage,
    overlayOpacity = 40,
    textColor,
    buttonColor,
    buttonTextColor
}: GiftCardBannerProps) {
    const bannerStyle = {
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundColor: backgroundImage ? undefined : 'var(--color-cream)',
    };

    const textStyle = {
        color: textColor || 'inherit'
    };

    const buttonStyle = {
        backgroundColor: 'white',
        color: 'black',
        borderColor: 'white'
    };

    return (
        <section className="container-premium section-spacing">
            <div
                className={styles.banner}
                style={bannerStyle}
            >
                {/* Overlay for legibility */}
                {backgroundImage && (
                    <div
                        className={styles.overlay}
                        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})` }}
                        aria-hidden="true"
                    />
                )}

                {/* Decorative elements (only if NO background image) */}
                {!backgroundImage && (
                    <>
                        <div className={styles.decorationTopLeft} aria-hidden="true" />
                        <div className={styles.decorationBottomRight} aria-hidden="true" />
                    </>
                )}

                <div className={styles.content}>
                    {logo && <span className={styles.logo} style={textStyle}>{logo}</span>}
                    {mainText && <h2 className={styles.mainText} style={textStyle}>{mainText}</h2>}
                    {subtitle && <span className={styles.subtitle} style={textStyle}>{subtitle}</span>}

                    <Link
                        href={link}
                        className={styles.cta}
                        style={buttonStyle}
                    >
                        {ctaText}
                    </Link>
                </div>
            </div>
        </section>
    );
}
