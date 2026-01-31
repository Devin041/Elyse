import { create } from 'zustand';
import type { CartItem } from '@/types';

interface UIState {
    mobileMenuOpen: boolean;
    cartDrawerOpen: boolean;
    searchModalOpen: boolean;
    showNotification: boolean;
    recentlyAddedItem: CartItem | null;
    authModalOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    setCartDrawerOpen: (open: boolean) => void;
    setSearchModalOpen: (open: boolean) => void;
    setShowNotification: (show: boolean) => void;
    setRecentlyAddedItem: (item: CartItem | null) => void;
    setAuthModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    mobileMenuOpen: false,
    cartDrawerOpen: false,
    searchModalOpen: false,
    showNotification: false,
    recentlyAddedItem: null,
    authModalOpen: false,
    setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
    setSearchModalOpen: (open) => set({ searchModalOpen: open }),
    setShowNotification: (show) => set({ showNotification: show }),
    setRecentlyAddedItem: (item) => set({ recentlyAddedItem: item }),
    setAuthModalOpen: (open) => set({ authModalOpen: open }),
}));
