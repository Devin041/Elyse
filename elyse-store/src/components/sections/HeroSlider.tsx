'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const slides = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1583391733958-e02376e9ced3?q=80&w=2070&auto=format&fit=crop', // Placeholder
        title: 'Festive Fashion by Elysè',
        subtitle: 'Discover the new collection',
        cta: 'Shop Now',
        link: '/collections/new-in',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2083&auto=format&fit=crop', // Placeholder
        title: 'Elegance Redefined',
        subtitle: 'Handcrafted for your special moments',
        cta: 'Explore',
        link: '/collections/all',
    },
];

export function HeroSlider() {
    return (
        <div className="relative h-[70vh] w-full">
            <Swiper
                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                effect="fade"
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation
                className="h-full w-full"
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div className="relative h-full w-full">
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                className="object-cover object-center"
                                priority
                            />
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="absolute inset-0 flex items-center justify-center text-center">
                                <div className="max-w-xl px-4 animate-fade-in">
                                    <h2 className="text-4xl font-serif font-bold text-white sm:text-6xl mb-4 drop-shadow-md">
                                        {slide.title}
                                    </h2>
                                    <p className="text-lg text-white mb-8 drop-shadow-md">
                                        {slide.subtitle}
                                    </p>
                                    <Link href={slide.link}>
                                        <Button size="lg" className="bg-white text-neutral-900 hover:bg-neutral-100 border-none">
                                            {slide.cta}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
