'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { AuthModal } from '@/components/auth/AuthModal';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const initialize = useAuthStore((state) => state.initialize);
    const syncWishlist = useWishlistStore((state) => state.syncWithDb);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (user) {
            syncWishlist(user.id);
        }
    }, [user, syncWishlist]);

    return (
        <>
            {children}
            <AuthModal />
        </>
    );
}
