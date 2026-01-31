'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, getCartTotal } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export default function CheckoutPage() {
    const router = useRouter();
    const { items } = useCartStore();
    const { user } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);
    const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
    });

    // Calculate totals - MUST be before any early returns
    const total = useMemo(() => getCartTotal(items), [items]);
    const shipping = 0; // Free shipping for now
    const tax = Math.round(total * 0.18); // 18% GST
    const finalTotal = total + shipping + tax;

    // Handle mounting
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Use useEffect for side effects like redirecting
    useEffect(() => {
        if (isMounted && items.length === 0) {
            router.push('/cart');
        }
    }, [isMounted, items.length, router]);

    if (!isMounted) return null;

    // Redirect if cart is empty after mount
    if (items.length === 0) {
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Prepare order data
            const orderData = {
                customer_email: formData.email,
                customer_phone: formData.phone,
                shipping_address: {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode
                },
                items: items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size,
                    color: item.color,
                    name: item.name,
                    image: item.image
                })),
                subtotal: total,
                tax: tax,
                shipping_cost: shipping,
                total: finalTotal,
                payment_method: 'cod'
            };

            // Call API to create order
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            const result = await response.json();

            // Save address to profile if checkbox is checked and user is logged in
            if (saveAddressToProfile && user) {
                try {
                    await supabase.from('user_addresses').insert([{
                        user_id: user.id,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        address_line1: formData.address,
                        city: formData.city,
                        state: formData.state,
                        postal_code: formData.pincode,
                        country: 'India',
                        phone: formData.phone,
                        is_default: false
                    }]);
                } catch (saveError) {
                    console.error('Failed to save address to profile:', saveError);
                    // Don't block order completion for this
                }
            }

            // Redirect to success page with real order number
            router.push(`/checkout/success?orderId=${result.order.order_number}`);

        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(`Order placement failed: ${error.message}. Please try again.`);
        }
    };

    return (
        <div className="bg-neutral-50 min-h-screen">
            <div className="container-custom py-8 sm:py-12">
                <h1 className="text-3xl font-serif font-bold mb-8">Checkout</h1>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Checkout Form */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Contact Information */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                                        placeholder="Street address"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                                            PIN Code
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            required
                                            pattern="[0-9]{6}"
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                                            placeholder="400001"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        pattern="[0-9]{10}"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                                        placeholder="9876543210"
                                    />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center p-4 border border-neutral-300 rounded-md cursor-pointer hover:border-neutral-900">
                                        <input type="radio" name="payment" value="cod" defaultChecked className="mr-3" />
                                        <span className="flex-1">Cash on Delivery</span>
                                    </label>
                                    <label className="flex items-center p-4 border border-neutral-300 rounded-md cursor-pointer hover:border-neutral-900 opacity-50">
                                        <input type="radio" name="payment" value="online" disabled className="mr-3" />
                                        <span className="flex-1">Online Payment (Coming Soon)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Save Address Checkbox (only for logged in users) */}
                            {user && (
                                <div className="flex items-center gap-3 mt-4">
                                    <input
                                        type="checkbox"
                                        id="saveAddress"
                                        checked={saveAddressToProfile}
                                        onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                                        className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-0 rounded"
                                    />
                                    <label htmlFor="saveAddress" className="text-sm text-neutral-600">
                                        Save this address to my profile for faster checkout
                                    </label>
                                </div>
                            )}

                            <Button type="submit" fullWidth size="lg">
                                Place Order
                            </Button>
                        </form>
                    </div>

                    {/* Right: Order Summary */}
                    <div>
                        <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
                            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                            {/* Items */}
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative w-16 h-16 flex-shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium">{item.name}</h3>
                                            <p className="text-xs text-neutral-500">
                                                {item.size} • Qty: {item.quantity}
                                            </p>
                                            <p className="text-sm font-medium mt-1">₹{item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pricing */}
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>₹{total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>GST (18%)</span>
                                    <span>₹{tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                                    <span>Total</span>
                                    <span>₹{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
