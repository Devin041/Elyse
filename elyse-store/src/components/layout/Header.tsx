'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBagIcon, MagnifyingGlassIcon, UserIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useCartStore, getCartItemCount } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { clsx } from 'clsx';
import { MegaMenu } from '@/components/navigation/MegaMenu';
import { UserAccountDropdown } from '@/components/auth/UserAccountDropdown';

const navigation = [
    { name: 'Festive New In', href: '/collections/new-arrivals' },
    { name: 'Shop by Style', href: '/collections/all', hasMegaMenu: true },
    { name: 'Bestsellers', href: '/collections/best-sellers' },
    { name: 'Gift Cards', href: '/products/gift-card' },
    { name: 'Blog', href: '/blog' },
    { name: 'Our Story', href: '/about' },
];

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const pathname = usePathname();
    const items = useCartStore((state) => state.items);
    const itemCount = useMemo(() => getCartItemCount(items), [items]);
    const { setMobileMenuOpen, setCartDrawerOpen, setSearchModalOpen, setAuthModalOpen } = useUIStore();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        setIsMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={clsx(
            'sticky top-0 z-40 w-full transition-all duration-300',
            isScrolled ? 'bg-white shadow-sm' : 'bg-white/80 backdrop-blur-md'
        )}>
            <nav className="container-custom flex items-center justify-between py-4 lg:px-8" aria-label="Global">
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-neutral-700"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex lg:flex-1">
                    <Link href="/" className="-m-1.5 p-1.5 font-serif text-2xl font-bold tracking-tight">
                        Elysè
                    </Link>
                </div>

                <div className="hidden lg:flex lg:gap-x-8">
                    {navigation.map((item) => {
                        // Replace "Shop by Style" with MegaMenu
                        if (item.hasMegaMenu) {
                            return <MegaMenu key={item.name} />;
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    'text-sm font-medium leading-6 transition-colors hover:text-neutral-600',
                                    pathname === item.href ? 'text-neutral-900' : 'text-neutral-500'
                                )}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="flex flex-1 justify-end items-center gap-x-4">
                    <button
                        className="text-neutral-500 hover:text-neutral-900"
                        onClick={() => setSearchModalOpen(true)}
                    >
                        <span className="sr-only">Search</span>
                        <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    {isMounted && user ? (
                        <UserAccountDropdown />
                    ) : (
                        <button
                            className="text-neutral-500 hover:text-neutral-900 transition-colors"
                            onClick={() => setAuthModalOpen(true)}
                        >
                            <span className="sr-only">Sign in</span>
                            <UserIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    )}

                    <button
                        className="group -m-2 flex items-center p-2"
                        onClick={() => setCartDrawerOpen(true)}
                    >
                        <ShoppingBagIcon
                            className="h-6 w-6 flex-shrink-0 text-neutral-500 group-hover:text-neutral-900"
                            aria-hidden="true"
                        />
                        <span className="ml-2 text-sm font-medium text-neutral-700 group-hover:text-neutral-800">
                            {isMounted ? itemCount : 0}
                        </span>
                        <span className="sr-only">items in cart, view bag</span>
                    </button>
                </div>
            </nav>
        </header>
    );
}
