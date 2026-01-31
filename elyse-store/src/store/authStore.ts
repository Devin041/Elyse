import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;

    // Actions
    setUser: (user: User | null) => void;
    signIn: (email: string) => Promise<{ error: Error | null }>;
    signInWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error: Error | null }>;
    verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,
            error: null,
            isInitialized: false,

            setUser: (user) => set({ user, error: null }),

            signIn: async (email) => {
                set({ isLoading: true, error: null });
                try {
                    const { error } = await supabase.auth.signInWithOtp({
                        email,
                        options: {
                            emailRedirectTo: window.location.origin,
                        },
                    });
                    if (error) throw error;
                    return { error: null };
                } catch (error: any) {
                    set({ error: error.message });
                    return { error };
                } finally {
                    set({ isLoading: false });
                }
            },

            signInWithOAuth: async (provider) => {
                set({ isLoading: true, error: null });
                try {
                    const { error } = await supabase.auth.signInWithOAuth({
                        provider,
                        options: {
                            redirectTo: `${window.location.origin}/auth/callback`,
                        },
                    });
                    if (error) throw error;
                    return { error: null };
                } catch (error: any) {
                    set({ error: error.message });
                    return { error };
                } finally {
                    set({ isLoading: false });
                }
            },

            verifyOtp: async (email, token) => {
                set({ isLoading: true, error: null });
                try {
                    const { data, error } = await supabase.auth.verifyOtp({
                        email,
                        token,
                        type: 'email',
                    });
                    if (error) throw error;
                    set({ user: data.user });
                    return { error: null };
                } catch (error: any) {
                    set({ error: error.message });
                    return { error };
                } finally {
                    set({ isLoading: false });
                }
            },

            signOut: async () => {
                await supabase.auth.signOut();
                set({ user: null });
            },

            initialize: async () => {
                if (get().isInitialized) return;

                const { data: { session } } = await supabase.auth.getSession();
                set({ user: session?.user ?? null, isInitialized: true });

                supabase.auth.onAuthStateChange((_event, session) => {
                    const currentUser = get().user;
                    const newUser = session?.user ?? null;

                    // Only update if ID or email changed to avoid reference-only loops
                    if (newUser?.id !== currentUser?.id || newUser?.email !== currentUser?.email) {
                        set({ user: newUser });
                    }
                });
            },
        }),
        {
            name: 'elyse-auth-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);
