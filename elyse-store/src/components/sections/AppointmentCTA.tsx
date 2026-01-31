'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import styles from './AppointmentCTA.module.css';

interface AppointmentCTAProps {
    label: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
}

export function AppointmentCTA({
    label,
    title,
    subtitle,
    ctaText,
    ctaLink,
    backgroundImage,
    backgroundColor,
    textColor,
    buttonColor,
    buttonTextColor
}: AppointmentCTAProps) {
    const textStyle = {
        color: textColor || 'white'
    };

    // Only apply custom button styling if explicitly provided
    // Otherwise, use the premium "SHOP NOW" style (transparent + white border)
    const hasCustomButtonStyle = buttonColor && buttonColor !== 'transparent' && buttonColor !== '';

    // Logic for Button Styling:
    // 1. We use the shared UI Button component for consistency (padding, font, shape).
    // 2. If user provides custom colors (buttonColor/buttonTextColor), we apply them.
    // 3. If NOT provided, we fall back to:
    //    - Background: 'white' (Standard Site Button / Hero Style)
    //    - Text: 'black'
    //    - Border: Transparent
    //    This ensures consistency with "Shop Now" in Hero.

    return (
        <section className={styles.section} style={{ backgroundColor: backgroundColor || '#f5f5f5' }}>
            {/* Background Image - EXACT crop display, no overlay */}
            {backgroundImage && (
                <Image
                    src={backgroundImage}
                    alt="Appointment CTA Background"
                    fill
                    priority
                    quality={100}
                    sizes="100vw"
                    className={styles.backgroundImage}
                />
            )}

            {/* Content overlay */}
            <div className={styles.content}>
                {label && <span className={styles.label} style={textStyle}>{label}</span>}
                {title && <h2 className={styles.title} style={textStyle}>{title}</h2>}
                {subtitle && <p className={styles.subtitle} style={textStyle}>{subtitle}</p>}

                <Link href={ctaLink}>
                    <Button
                        size="lg"
                        className="transition-all duration-300 hover:bg-white/90 hover:-translate-y-1 uppercase tracking-widest shadow-md"
                        style={{
                            backgroundColor: 'white',
                            color: 'black',
                            borderColor: 'white',
                            borderWidth: '1px',
                            borderStyle: 'solid'
                        }}
                    >
                        {ctaText || 'Contact Us'}
                    </Button>
                </Link>
            </div>
        </section>
    );
}
