'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore, getCartTotal, getCartItemCount } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export default function CartPage() {
    const { items, removeItem, updateQuantity } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const subtotal = useMemo(() => getCartTotal(items), [items]);
    const itemCount = useMemo(() => getCartItemCount(items), [items]);

    if (!isMounted) return null;

    if (items.length === 0) {
        return (
            <div className="container-custom py-24 text-center">
                <h1 className="text-3xl font-serif font-bold mb-6 text-neutral-900">Your Cart</h1>
                <p className="text-neutral-500 mb-8 font-medium">Your cart is currently empty.</p>
                <Link href="/">
                    <Button className="bg-black text-white px-8 py-3 rounded hover:bg-neutral-800 transition-colors">
                        CONTINUE SHOPPING
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="container-custom py-16 sm:py-24">
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-3xl font-serif font-bold tracking-tight text-neutral-900 sm:text-4xl">Your Cart</h1>
                    <p className="text-sm text-neutral-500 font-medium">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                </div>

                <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                    <section aria-labelledby="cart-heading" className="lg:col-span-7">
                        <h2 id="cart-heading" className="sr-only">Items in your shopping cart</h2>

                        <ul role="list" className="divide-y divide-neutral-200 border-b border-t border-neutral-200">
                            {items.map((item) => (
                                <li key={item.id} className="flex py-6 sm:py-10">
                                    <div className="flex-shrink-0">
                                        <div className="relative h-24 w-24 sm:h-48 sm:w-48 overflow-hidden rounded-md border border-neutral-100 bg-neutral-50 shadow-sm">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-neutral-100 text-neutral-400">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                            <div>
                                                <div className="flex justify-between">
                                                    <h3 className="text-base font-bold text-neutral-900 uppercase tracking-wider">
                                                        <Link href={`/products/${item.productSlug}`} className="hover:text-neutral-600 transition-colors">
                                                            {item.name}
                                                        </Link>
                                                    </h3>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-neutral-500 font-medium">
                                                    {item.color && (
                                                        <span className="flex items-center">
                                                            Color: {item.color}
                                                        </span>
                                                    )}
                                                    {item.size && (
                                                        <span className={clsx("ml-4 border-l border-neutral-200 pl-4")}>
                                                            Size: {item.size}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.variant?.sku && (
                                                    <p className="mt-1 text-[10px] text-neutral-400 font-mono tracking-tighter">
                                                        SKU: {item.variant.sku}
                                                    </p>
                                                )}
                                                <p className="mt-4 text-base font-bold text-neutral-900">
                                                    ₹{(item.price || 0).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="mt-4 sm:mt-0 sm:pr-9">
                                                <div className="flex items-center border border-neutral-200 rounded divide-x divide-neutral-200 w-fit shadow-sm bg-neutral-50">
                                                    <button
                                                        className="p-2 hover:bg-neutral-100 text-neutral-600 transition-colors"
                                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                    >
                                                        <MinusIcon className="h-4 w-4" />
                                                    </button>
                                                    <span className="px-5 py-1 text-center w-14 font-bold text-neutral-900">{item.quantity}</span>
                                                    <button
                                                        className="p-2 hover:bg-neutral-100 text-neutral-600 transition-colors"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <PlusIcon className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="absolute right-0 top-0">
                                                    <button
                                                        type="button"
                                                        className="-m-2 p-2 text-neutral-400 hover:text-red-600 transition-colors"
                                                        onClick={() => removeItem(item.id)}
                                                    >
                                                        <span className="sr-only">Remove</span>
                                                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Order summary */}
                    <section
                        aria-labelledby="summary-heading"
                        className="mt-16 rounded-lg bg-neutral-50 px-4 py-8 sm:p-10 lg:col-span-5 lg:mt-0 shadow-sm border border-neutral-100"
                    >
                        <h2 id="summary-heading" className="text-xl font-bold font-serif text-neutral-900 tracking-wider">
                            ORDER SUMMARY
                        </h2>

                        <dl className="mt-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <dt className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</dt>
                                <dd className="text-lg font-bold text-neutral-900">₹{subtotal.toLocaleString()}</dd>
                            </div>
                            <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
                                <dt className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Shipping</dt>
                                <dd className="text-sm font-bold text-green-600 uppercase tracking-widest italic">Calculated at checkout</dd>
                            </div>
                            <div className="flex items-center justify-between border-t border-neutral-900 pt-8">
                                <dt className="text-lg font-black text-neutral-900 uppercase tracking-tighter">Total</dt>
                                <dd className="text-2xl font-black text-neutral-900">₹{subtotal.toLocaleString()}</dd>
                            </div>
                        </dl>

                        <div className="mt-10">
                            <Link href="/checkout">
                                <Button fullWidth size="lg" className="bg-black text-white hover:bg-neutral-800 transition-all font-bold tracking-[0.2em] py-5 rounded shadow-xl">
                                    PROCEED TO CHECKOUT
                                </Button>
                            </Link>
                        </div>
                        <p className="mt-4 text-[10px] text-center text-neutral-400 uppercase tracking-widest italic">Secure checkout with SSL encryption</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
