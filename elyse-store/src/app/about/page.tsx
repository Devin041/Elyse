import { Metadata } from 'next';
import { AboutContent } from './AboutContent';

export const metadata: Metadata = {
    title: 'About Elysè | Premium Modern Ethnic Wear & Luxury Indian Fashion',
    description: 'Discover the story behind Elysè. Handcrafted luxury ethnic wear blending traditional Indian craftsmanship with contemporary silhouettes for the modern woman.',
};

export default function AboutPage() {
    return <AboutContent />;
}
