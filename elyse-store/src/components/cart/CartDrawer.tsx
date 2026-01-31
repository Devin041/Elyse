'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore, getCartTotal } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';

const FREE_SHIPPING_THRESHOLD = 5000;

export function CartDrawer() {
    const { items, removeItem, updateQuantity } = useCartStore();
    const { cartDrawerOpen, setCartDrawerOpen } = useUIStore();

    const total = getCartTotal(items);

    const freeShippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);

    return (
        <Transition.Root show={cartDrawerOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setCartDrawerOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-lg font-medium text-neutral-900">Shopping cart</Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative -m-2 p-2 text-neutral-400 hover:text-neutral-500"
                                                        onClick={() => setCartDrawerOpen(false)}
                                                    >
                                                        <span className="absolute -inset-0.5" />
                                                        <span className="sr-only">Close panel</span>
                                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Free Shipping Progress Bar */}
                                            {items.length > 0 && (
                                                <div className="mt-4 rounded-lg bg-green-50 p-4 border border-green-200">
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="font-medium text-neutral-900">
                                                            {amountToFreeShipping > 0
                                                                ? `Buy ₹${amountToFreeShipping.toLocaleString()} more for free shipping!`
                                                                : '🎉 You get free shipping!'
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-neutral-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${freeShippingProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-8">
                                                <div className="flow-root">
                                                    {items.length === 0 ? (
                                                        <div className="text-center py-10">
                                                            <p className="text-neutral-500">Your cart is empty.</p>
                                                            <Button
                                                                className="mt-4"
                                                                onClick={() => setCartDrawerOpen(false)}
                                                            >
                                                                Continue Shopping
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <ul role="list" className="-my-6 divide-y divide-neutral-200">
                                                            {items.map((item) => (
                                                                <li key={item.id} className="flex py-6">
                                                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200 relative">
                                                                        <Image
                                                                            src={item.image}
                                                                            alt={item.name}
                                                                            fill
                                                                            className="h-full w-full object-cover object-center"
                                                                        />
                                                                    </div>

                                                                    <div className="ml-4 flex flex-1 flex-col">
                                                                        <div>
                                                                            <div className="flex justify-between text-base font-medium text-neutral-900">
                                                                                <h3>
                                                                                    <Link href={`/products/${item.productId}`} onClick={() => setCartDrawerOpen(false)}>
                                                                                        {item.name}
                                                                                    </Link>
                                                                                </h3>
                                                                                <p className="ml-4">₹{((item.price || 0) * item.quantity).toLocaleString()}</p>
                                                                            </div>
                                                                            <p className="mt-1 text-sm text-neutral-500">{item.color} / {item.size}</p>
                                                                        </div>
                                                                        <div className="flex flex-1 items-end justify-between text-sm">
                                                                            <div className="flex items-center border border-neutral-300 rounded-sm">
                                                                                <button
                                                                                    className="p-1 hover:bg-neutral-100"
                                                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                                                >
                                                                                    <MinusIcon className="h-3 w-3" />
                                                                                </button>
                                                                                <span className="px-2 text-xs">{item.quantity}</span>
                                                                                <button
                                                                                    className="p-1 hover:bg-neutral-100"
                                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                                >
                                                                                    <PlusIcon className="h-3 w-3" />
                                                                                </button>
                                                                            </div>

                                                                            <button
                                                                                type="button"
                                                                                className="font-medium text-red-600 hover:text-red-500 flex items-center"
                                                                                onClick={() => removeItem(item.id)}
                                                                            >
                                                                                <TrashIcon className="h-4 w-4 mr-1" />
                                                                                Remove
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {items.length > 0 && (
                                            <div className="border-t border-neutral-200 px-4 py-6 sm:px-6">
                                                <div className="flex justify-between text-base font-medium text-neutral-900">
                                                    <p>Subtotal</p>
                                                    <p>₹{(total || 0).toLocaleString()}</p>
                                                </div>
                                                <p className="mt-0.5 text-sm text-neutral-500">Shipping and taxes calculated at checkout.</p>
                                                <div className="mt-6">
                                                    <Link
                                                        href="/cart"
                                                        className="flex items-center justify-center rounded-md border border-transparent bg-neutral-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-neutral-800"
                                                        onClick={() => setCartDrawerOpen(false)}
                                                    >
                                                        Checkout
                                                    </Link>
                                                </div>
                                                <div className="mt-6 flex justify-center text-center text-sm text-neutral-500">
                                                    <p>
                                                        or{' '}
                                                        <button
                                                            type="button"
                                                            className="font-medium text-neutral-900 hover:text-neutral-800"
                                                            onClick={() => setCartDrawerOpen(false)}
                                                        >
                                                            Continue Shopping
                                                            <span aria-hidden="true"> &rarr;</span>
                                                        </button>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
