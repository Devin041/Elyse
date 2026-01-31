'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    UserIcon,
    ShoppingBagIcon,
    HeartIcon,
    MapPinIcon,
    ArrowRightOnRectangleIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

export function UserAccountDropdown() {
    const { user, signOut } = useAuthStore();
    const { clearWishlist } = useWishlistStore();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut();
            clearWishlist();
            toast.success('Signed out successfully');
            router.push('/');
        } catch (error) {
            toast.error('Failed to sign out');
        }
    };

    if (!user) return null;

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 transition-colors focus:outline-none group">
                    <UserIcon className="h-6 w-6 text-neutral-900" aria-hidden="true" />
                    <ChevronDownIcon className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="z-50 min-w-[220px] bg-white rounded-none shadow-xl border border-neutral-100 p-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right mr-4"
                    align="end"
                    sideOffset={8}
                >
                    <div className="px-3 py-3 border-b border-neutral-50 mb-1">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">Signed in as</p>
                        <p className="text-sm font-medium text-neutral-900 truncate">{user.email}</p>
                    </div>

                    <DropdownMenu.Item asChild>
                        <Link
                            href="/account?tab=profile"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 outline-none cursor-pointer transition-colors"
                        >
                            <UserIcon className="h-4 w-4" />
                            <span>Profile Details</span>
                        </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item asChild>
                        <Link
                            href="/account?tab=orders"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 outline-none cursor-pointer transition-colors"
                        >
                            <ShoppingBagIcon className="h-4 w-4" />
                            <span>Order History</span>
                        </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item asChild>
                        <Link
                            href="/account?tab=favorites"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 outline-none cursor-pointer transition-colors"
                        >
                            <HeartIcon className="h-4 w-4" />
                            <span>My Favorites</span>
                        </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item asChild>
                        <Link
                            href="/account?tab=addresses"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 outline-none cursor-pointer transition-colors"
                        >
                            <MapPinIcon className="h-4 w-4" />
                            <span>Address Book</span>
                        </Link>
                    </DropdownMenu.Item>

                    <div className="h-px bg-neutral-100 my-1" />

                    <DropdownMenu.Item
                        onSelect={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 outline-none cursor-pointer transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        <span className="font-medium">Sign Out</span>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
