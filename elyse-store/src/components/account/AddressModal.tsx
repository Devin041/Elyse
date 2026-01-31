'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { UserAddress } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: UserAddress | null;
}

export function AddressModal({ isOpen, onClose, onSave, initialData }: AddressModalProps) {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        const addressData = {
            first_name: formData.get('first_name') as string,
            last_name: formData.get('last_name') as string,
            phone: formData.get('phone') as string,
            address_line1: formData.get('address_line1') as string,
            address_line2: formData.get('address_line2') as string,
            city: formData.get('city') as string,
            state: formData.get('state') as string,
            postal_code: formData.get('postal_code') as string,
            country: formData.get('country') as string || 'India',
            is_default: formData.get('is_default') === 'on',
        };

        try {
            await onSave(addressData);
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save address');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
                <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg bg-white p-6 sm:p-8 shadow-2xl z-50 animate-in zoom-in-95 fade-in duration-300 rounded-none overflow-y-auto max-h-[90vh]">
                    <div className="flex items-center justify-between mb-8">
                        <Dialog.Title className="text-2xl font-serif font-bold text-neutral-900">
                            {initialData ? 'Edit Address' : 'Add New Address'}
                        </Dialog.Title>
                        <Dialog.Close className="text-neutral-400 hover:text-neutral-900 transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">First Name</label>
                                <input
                                    name="first_name"
                                    defaultValue={initialData?.first_name}
                                    required
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 focus:border-neutral-900 focus:bg-white outline-none transition-all text-sm rounded-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Last Name</label>
                                <input
                                    name="last_name"
                                    defaultValue={initialData?.last_name}
                                    required
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 focus:border-neutral-900 focus:bg-white outline-none transition-all text-sm rounded-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Phone Number</label>
                            <input
                                name="phone"
                                defaultValue={initialData?.phone}
                                required
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 focus:border-neutral-900 focus:bg-white outline-none transition-all text-sm rounded-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Address Line 1</label>
                            <input
                                name="address_line1"
                                defaultValue={initialData?.address_line1}
                                required
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 focus:border-neutral-900 focus:bg-white outline-none transition-all text-sm rounded-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Address Line 2 (Optional)</label>
                            <input
                                name="address_line2"
                                defaultValue={initialData?.address_line2}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 focus:border-neutral-900 focus:bg-white outline-none transition-all text-sm rounded-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">City</label>
                                <input
                                    name="city"
                                    defaultValue={initialData?.city}
                                    required
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 focus:border-neutral-900 focus:bg-white outline-none transition-all text-sm rounded-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">State</label>
                                <input
                                    name="state"
                                    defaultValue={initialData?.state}
                                    required
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 focus:border-neutral-900 focus:bg-white outline-none transition-all text-sm rounded-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Postal Code</label>
                                <input
                                    name="postal_code"
                                    defaultValue={initialData?.postal_code}
                                    required
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 focus:border-neutral-900 focus:bg-white outline-none transition-all text-sm rounded-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Country</label>
                                <input
                                    name="country"
                                    defaultValue={initialData?.country || 'India'}
                                    required
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 focus:border-neutral-900 focus:bg-white outline-none transition-all text-sm rounded-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <input
                                id="is_default"
                                name="is_default"
                                type="checkbox"
                                defaultChecked={initialData?.is_default}
                                className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-0 rounded-none"
                            />
                            <label htmlFor="is_default" className="text-sm text-neutral-600">Set as default address</label>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 py-4 uppercase tracking-widest text-xs font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="flex-1 py-4 uppercase tracking-widest text-xs font-bold"
                            >
                                {initialData ? 'Update' : 'Save Address'}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
