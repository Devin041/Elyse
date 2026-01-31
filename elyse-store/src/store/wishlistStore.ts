import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface WishlistItem {
    id: string; // This is the wishlist_item ID or a stable unique ID
    productId: string;
    variantId?: string;
    addedAt: string;
}

interface WishlistState {
    items: WishlistItem[];
    isLoading: boolean;

    // Actions
    addItem: (productId: string, variantId?: string) => Promise<void>;
    removeItem: (productId: string, variantId?: string) => Promise<void>;
    isInWishlist: (productId: string, variantId?: string) => boolean;
    syncWithDb: (userId: string) => Promise<void>;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,
            lastSyncedUserId: null as string | null,

            addItem: async (productId, variantId) => {
                const { items } = get();
                const alreadyIn = items.some(i => i.productId === productId && i.variantId === variantId);
                if (alreadyIn) return;

                const newItem: WishlistItem = {
                    id: Math.random().toString(36).substr(2, 9),
                    productId,
                    variantId,
                    addedAt: new Date().toISOString()
                };

                set({ items: [...items, newItem] });

                // Sync with DB if logged in
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    try {
                        console.log('Syncing new wishlist item to DB:', { productId, variantId });
                        const { error } = await supabase.from('wishlist_items').insert({
                            user_id: session.user.id,
                            product_id: productId,
                            variant_id: variantId
                        });
                        if (error) throw error;
                        console.log('Successfully synced wishlist item to DB');
                    } catch (e) {
                        console.error('Failed to sync wishlist item to DB', e);
                    }
                }
            },

            removeItem: async (productId, variantId) => {
                const { items } = get();
                const targetVariantId = variantId || undefined;
                const newItems = items.filter(i => !(i.productId === productId && (i.variantId || undefined) === targetVariantId));
                set({ items: newItems });

                // Sync with DB if logged in
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    try {
                        await supabase.from('wishlist_items')
                            .delete()
                            .match({
                                user_id: session.user.id,
                                product_id: productId,
                                ...(variantId ? { variant_id: variantId } : {})
                            });
                    } catch (e) {
                        console.error('Failed to remove wishlist item from DB', e);
                    }
                }
            },

            isInWishlist: (productId, variantId) => {
                const { items } = get();
                // Normalize variantId for comparison (null/undefined treated same)
                const targetVariantId = variantId || undefined;
                return items.some(i =>
                    i.productId === productId &&
                    (i.variantId || undefined) === targetVariantId
                );
            },

            syncWithDb: async (userId) => {
                if (get().isLoading && get().lastSyncedUserId === userId) return;

                set({ isLoading: true, lastSyncedUserId: userId });
                try {
                    console.log('Fetching wishlist from DB for user:', userId);
                    const { data: dbItems, error } = await supabase
                        .from('wishlist_items')
                        .select('*')
                        .eq('user_id', userId);

                    if (error) throw error;

                    if (dbItems) {
                        const mapped: WishlistItem[] = dbItems.map(i => ({
                            id: i.id?.toString() || `${i.product_id}-${i.variant_id}`,
                            productId: i.product_id,
                            variantId: i.variant_id || undefined,
                            addedAt: i.added_at
                        }));

                        // Merge logic: prioritize DB items, but keep local items that might be in flight
                        const { items: localItems } = get();
                        const merged = [...mapped];

                        localItems.forEach(local => {
                            const inDb = mapped.some(db =>
                                db.productId === local.productId &&
                                db.variantId === local.variantId
                            );
                            if (!inDb) {
                                // Keep locally added items for a grace period or if they are "new"
                                merged.push(local);
                            }
                        });

                        set({ items: merged });
                    }
                } catch (e) {
                    console.error('Wishlist sync failed', e);
                } finally {
                    set({ isLoading: false });
                }
            },

            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: 'elyse-wishlist-storage',
        }
    )
);
