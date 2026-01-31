'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Button } from '@/components/ui/Button';
import {
    UserIcon,
    ShoppingBagIcon,
    MapPinIcon,
    ArrowLeftOnRectangleIcon,
    ChevronRightIcon,
    HeartIcon
} from '@heroicons/react/24/outline';
import { ProductCard } from '@/components/product/ProductCard';
import { AddressModal } from '@/components/account/AddressModal';
import { supabase } from '@/lib/supabase';
import type { Product, UserAddress, Order } from '@/types';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { OrderTrackingSteps } from '@/components/account/OrderTrackingSteps';

// Debug check for the user's email to ensure order linking is correct
// console.log("Current user email:", user?.email);

const tabs = [
    { id: 'profile', name: 'Profile Details', icon: UserIcon },
    { id: 'orders', name: 'Order History', icon: ShoppingBagIcon },
    { id: 'favorites', name: 'My Favorites', icon: HeartIcon },
    { id: 'addresses', name: 'Address Book', icon: MapPinIcon },
];

export default function AccountPage() {
    const { user, signOut, isInitialized } = useAuthStore();
    const { items: wishlistItems, clearWishlist } = useWishlistStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('profile');
    const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    // Data states
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Modal states
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Sync active tab with query params
    useEffect(() => {
        setIsMounted(true);
        const tab = searchParams.get('tab');
        if (tab && tabs.find(t => t.id === tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const lastFetchRef = useRef<{ tab: string; userId: string } | null>(null);

    const fetchData = useCallback(async (force: boolean = false) => {
        if (!user) return;

        // CTO Loop Prevention: Don't refetch if the key data hasn't changed (unless forced)
        if (!force && lastFetchRef.current?.tab === activeTab && lastFetchRef.current?.userId === user.id) {
            return;
        }

        // Mark as attempted immediately to stop the hammer
        lastFetchRef.current = { tab: activeTab, userId: user.id };

        setIsLoadingData(true);
        try {
            if (activeTab === 'addresses') {
                const { data, error } = await supabase
                    .from('user_addresses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('is_default', { ascending: false });
                if (error) throw error;
                setAddresses(data || []);
            } else if (activeTab === 'orders') {
                // Fetch orders from backend
                const { data: { session } } = await supabase.auth.getSession();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/orders`, {
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`
                    }
                });
                const result = await response.json();
                if (result.success) {
                    setOrders(result.data || []);
                }
            }
        } catch (error) {
            console.error("Error fetching account data:", error);
        } finally {
            setIsLoadingData(false);
        }
    }, [activeTab, user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const fetchWishlistProducts = async () => {
            if (activeTab === 'favorites' && wishlistItems.length > 0) {
                setIsWishlistLoading(true);
                try {
                    const productPromises = wishlistItems.map(item =>
                        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/products/by-id/${item.productId}`)
                            .then(res => res.json())
                            .then(data => data.data)
                    );
                    const products = await Promise.all(productPromises);
                    setWishlistProducts(products.filter(p => p));
                } catch (e) {
                    console.error("Failed to fetch wishlist products", e);
                } finally {
                    setIsWishlistLoading(false);
                }
            }
        };
        fetchWishlistProducts();
    }, [activeTab, wishlistItems]);

    useEffect(() => {
        if (isInitialized && !user) {
            router.push('/');
        }
    }, [user, isInitialized, router]);

    if (!isMounted || !isInitialized || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
            </div>
        );
    }

    const handleLogout = async () => {
        await signOut();
        clearWishlist();
        router.push('/');
    };

    const handleSaveAddress = async (formData: any) => {
        try {
            if (editingAddress) {
                const { error } = await supabase
                    .from('user_addresses')
                    .update({
                        ...formData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingAddress.id);
                if (error) throw error;
                toast.success('Address updated successfully');
            } else {
                const { error } = await supabase
                    .from('user_addresses')
                    .insert([{
                        ...formData,
                        user_id: user.id
                    }]);
                if (error) throw error;
                toast.success('Address added successfully');
            }
            setIsAddressModalOpen(false);
            setEditingAddress(null);
            fetchData(true); // Force refresh to show new address
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            const { error } = await supabase
                .from('user_addresses')
                .delete()
                .eq('id', id);
            if (error) throw error;
            toast.success('Address deleted successfully');
            fetchData(true); // Force refresh
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-12">
            <div className="container-premium">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 space-y-2">
                        <h1 className="text-3xl font-serif mb-8 md:hidden">My Account</h1>
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        router.push(`/account?tab=${tab.id}`, { scroll: false });
                                    }}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all text-sm",
                                        activeTab === tab.id
                                            ? "bg-white shadow-sm text-neutral-900 border-l-2 border-neutral-900 font-medium"
                                            : "text-neutral-500 hover:bg-white/50 hover:text-neutral-900"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.name}
                                    <ChevronRightIcon className={clsx(
                                        "w-4 h-4 ml-auto transition-transform",
                                        activeTab === tab.id ? "opacity-100" : "opacity-0"
                                    )} />
                                </button>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-red-500 hover:bg-red-50 transition-all text-sm mt-8"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                            Sign Out
                        </button>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 bg-white rounded-sm shadow-sm p-6 md:p-10 min-h-[600px]">
                        <h1 className="text-3xl font-serif mb-10 hidden md:block">
                            {tabs.find(t => t.id === activeTab)?.name}
                        </h1>

                        {activeTab === 'profile' && (
                            <div className="max-w-xl space-y-8">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <p className="text-lg text-neutral-900">{user.email}</p>
                                </div>
                                <div className="pt-6 border-t border-neutral-100 italic text-neutral-500">
                                    Additional profile settings coming soon.
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                <p className="text-neutral-500 mb-8">Check the status of your orders and view your purchase history.</p>
                                {isLoadingData ? (
                                    <div className="space-y-4">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="h-32 bg-neutral-100 animate-pulse rounded-sm"></div>
                                        ))}
                                    </div>
                                ) : orders.length > 0 ? (
                                    <div className="space-y-6">
                                        {orders.map((order) => (
                                            <div key={order.id} className="border border-neutral-200 rounded-sm overflow-hidden">
                                                <div className="bg-neutral-50 p-4 flex flex-wrap justify-between gap-4 border-b border-neutral-200 text-sm">
                                                    <div>
                                                        <p className="text-neutral-500 mb-1">Order Placed</p>
                                                        <p className="font-medium text-neutral-900">{new Date(order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-neutral-500 mb-1">Total</p>
                                                        <p className="font-medium text-neutral-900">₹{(order.total_amount || 0).toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-neutral-500 mb-1">Order #</p>
                                                        <p className="font-medium text-neutral-900">{order.order_number}</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <span className={clsx(
                                                            "px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider",
                                                            order.status === 'delivered' ? "bg-green-100 text-green-700" :
                                                                order.status === 'cancelled' ? "bg-red-100 text-red-700" :
                                                                    "bg-blue-100 text-blue-700"
                                                        )}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <OrderTrackingSteps status={order.status || 'pending'} />

                                                    {/* Order Items Section */}
                                                    {order.items && order.items.length > 0 && (
                                                        <div className="mt-12 space-y-4 border-t border-neutral-100 pt-6">
                                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">Items in Order</h4>
                                                            {order.items.map((item: any) => (
                                                                <div key={item.id} className="flex items-center gap-4">
                                                                    <div className="w-16 h-20 bg-neutral-50 rounded-sm overflow-hidden flex-shrink-0 border border-neutral-100">
                                                                        {item.image_url ? (
                                                                            <img
                                                                                src={item.image_url}
                                                                                alt={item.product_name}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                                                <ShoppingBagIcon className="w-6 h-6" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-neutral-900 truncate">{item.product_name}</p>
                                                                        <p className="text-xs text-neutral-500">Qty: {item.quantity} • {item.variant_sku}</p>
                                                                        {item.size && <span className="text-[10px] uppercase bg-neutral-100 px-1.5 py-0.5 rounded-sm mr-2">{item.size}</span>}
                                                                        {item.color && <span className="text-[10px] uppercase bg-neutral-100 px-1.5 py-0.5 rounded-sm">{item.color}</span>}
                                                                    </div>
                                                                    <div className="text-sm font-medium text-neutral-900">
                                                                        ₹{(item.price_at_purchase || 0).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 border-2 border-dashed border-neutral-100 rounded-sm">
                                        <div className="bg-neutral-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShoppingBagIcon className="w-8 h-8 text-neutral-300" />
                                        </div>
                                        <h3 className="text-lg font-medium text-neutral-900 mb-2">No orders yet</h3>
                                        <p className="text-neutral-500 mb-8 max-w-xs mx-auto">You haven&apos;t placed any orders with Elysè yet. Explore our latest arrivals to find something perfect.</p>
                                        <Button onClick={() => router.push('/collections/festive-new-in')} variant="primary" size="lg">
                                            START SHOPPING
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'favorites' && (
                            <div className="space-y-6">
                                {isWishlistLoading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse rounded-sm"></div>
                                        ))}
                                    </div>
                                ) : wishlistProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                                        {wishlistProducts.map((product) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 border-2 border-dashed border-neutral-100 rounded-sm">
                                        <div className="bg-neutral-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <HeartIcon className="w-8 h-8 text-neutral-300" />
                                        </div>
                                        <h3 className="text-lg font-medium text-neutral-900 mb-2">Your wishlist is empty</h3>
                                        <p className="text-neutral-500 mb-8 max-w-xs mx-auto">Save your favorite pieces here to keep an eye on them. Start browsing our collections now.</p>
                                        <Button onClick={() => router.push('/collections/festive-new-in')} variant="primary" size="lg">
                                            EXPLORE COLLECTIONS
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-8">
                                    <p className="text-neutral-500">Manage your shipping and billing addresses.</p>
                                    <Button onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true); }} variant="outline" size="sm">
                                        ADD NEW ADDRESS
                                    </Button>
                                </div>

                                {isLoadingData ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="h-48 bg-neutral-100 animate-pulse rounded-sm"></div>
                                        ))}
                                    </div>
                                ) : addresses.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {addresses.map((address) => (
                                            <div key={address.id} className={clsx(
                                                "p-6 border rounded-sm relative group transition-all",
                                                address.is_default ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"
                                            )}>
                                                {address.is_default && (
                                                    <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-neutral-900">Default</span>
                                                )}
                                                <h3 className="font-medium text-lg mb-4">{address.first_name} {address.last_name}</h3>
                                                <div className="text-sm text-neutral-600 space-y-1 mb-6">
                                                    <p>{address.address_line1}</p>
                                                    {address.address_line2 && <p>{address.address_line2}</p>}
                                                    <p>{address.city}, {address.state} {address.postal_code}</p>
                                                    <p>{address.country}</p>
                                                    <p className="pt-2">T: {address.phone}</p>
                                                </div>
                                                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setEditingAddress(address); setIsAddressModalOpen(true); }}
                                                        className="text-xs font-medium uppercase tracking-wider hover:text-neutral-900 underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAddress(address.id)}
                                                        className="text-xs font-medium uppercase tracking-wider text-red-500 hover:text-red-700 underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 border-2 border-dashed border-neutral-100 rounded-sm">
                                        <div className="bg-neutral-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MapPinIcon className="w-8 h-8 text-neutral-300" />
                                        </div>
                                        <h3 className="text-lg font-medium text-neutral-900 mb-2">No addresses saved</h3>
                                        <p className="text-neutral-500 mb-8 max-w-xs mx-auto">Add your shipping addresses for a faster checkout experience.</p>
                                        <Button onClick={() => setIsAddressModalOpen(true)} variant="primary" size="lg">
                                            ADD FIRST ADDRESS
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => { setIsAddressModalOpen(false); setEditingAddress(null); }}
                onSave={handleSaveAddress}
                initialData={editingAddress || undefined}
            />
        </div>
    );
}
