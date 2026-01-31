'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const messages = [
    { text: 'Free shipping on orders above ₹5,000', link: null },
    { text: 'Explore our Navratri Collection Now!', link: '/collections/new-in' },
];

export function AnnouncementBar() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Prevent hydration mismatch by rendering static content on server
    if (!mounted) {
        return (
            <div className="bg-primary-100 text-neutral-900 text-xs sm:text-sm py-2.5 text-center">
                <div className="container-custom">
                    <span>{messages[0].text}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-primary-100 text-neutral-900 text-xs sm:text-sm py-2.5 text-center relative overflow-hidden">
            <div className="container-custom">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`transition-all duration-500 absolute inset-0 flex items-center justify-center ${index === currentIndex
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-full pointer-events-none'
                            }`}
                    >
                        {msg.link ? (
                            <Link href={msg.link} className="hover:underline font-medium">
                                {msg.text}
                            </Link>
                        ) : (
                            <span>{msg.text}</span>
                        )}
                    </div>
                ))}
                {/* Spacer to give height since absolute children don't contribute to height */}
                <div className="opacity-0 pointer-events-none">
                    {messages[0].text}
                </div>
            </div>
        </div>
    );
}
