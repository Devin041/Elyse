'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { clearCart } = useCartStore();

    // Clear cart on success
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="mb-6">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                </div>

                <h1 className="text-2xl font-serif font-bold mb-2">Order Confirmed!</h1>
                <p className="text-neutral-600 mb-6">
                    Thank you for your order. We've received your order and will process it shortly.
                </p>

                {orderId && (
                    <div className="bg-neutral-100 p-4 rounded-md mb-6">
                        <p className="text-sm text-neutral-600">Order Number</p>
                        <p className="text-lg font-semibold">{orderId}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <Link href="/">
                        <Button fullWidth>Continue Shopping</Button>
                    </Link>
                    <p className="text-sm text-neutral-500">
                        You will receive an email confirmation shortly.
                    </p>
                </div>
            </div>
        </div>
    );
}
