'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';
import { clsx } from 'clsx';

const navigation = [
    { name: 'Festive New In', href: '/collections/new-in' },
    { name: 'Shop by Style', href: '/collections/all' },
    { name: 'Bestsellers', href: '/collections/bestsellers' },
    { name: 'Gift Cards', href: '/products/gift-card' },
    { name: 'Blog', href: '/blog' },
    { name: 'Our Story', href: '/about' },
];

export function MobileMenu() {
    const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

    return (
        <Transition.Root show={mobileMenuOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileMenuOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="transition-opacity ease-linear duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease-linear duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25" />
                </Transition.Child>

                <div className="fixed inset-0 z-50 flex">
                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-in-out duration-300 transform"
                        enterFrom="-translate-x-full"
                        enterTo="translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full"
                    >
                        <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl">
                            <div className="flex px-4 pb-2 pt-5">
                                <button
                                    type="button"
                                    className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-neutral-400"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="sr-only">Close menu</span>
                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>

                            <div className="space-y-6 border-t border-neutral-200 px-4 py-6">
                                {navigation.map((page) => (
                                    <div key={page.name} className="flow-root">
                                        <Link
                                            href={page.href}
                                            className="-m-2 block p-2 font-medium text-neutral-900"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {page.name}
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6 border-t border-neutral-200 px-4 py-6">
                                <div className="flow-root">
                                    <Link href="#" className="-m-2 block p-2 font-medium text-neutral-900">
                                        Sign in
                                    </Link>
                                </div>
                                <div className="flow-root">
                                    <Link href="#" className="-m-2 block p-2 font-medium text-neutral-900">
                                        Create account
                                    </Link>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
