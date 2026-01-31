'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import {
    EnvelopeIcon,
    ShieldCheckIcon,
    ArrowRightIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';

const emailSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

const otpSchema = z.object({
    otp: z.string().length(6, 'Verification code must be 6 digits'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export function AuthModal() {
    const { authModalOpen, setAuthModalOpen } = useUIStore();
    const { signIn, signInWithOAuth, verifyOtp, isLoading } = useAuthStore();
    const [step, setStep] = useState<'selection' | 'email' | 'otp'>('selection');
    const [userEmail, setUserEmail] = useState('');

    const emailForm = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
    });

    const otpForm = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
    });

    // Reset state when modal closes
    useEffect(() => {
        if (!authModalOpen) {
            setStep('selection');
            setUserEmail('');
            emailForm.reset();
            otpForm.reset();
        }
    }, [authModalOpen, emailForm, otpForm]);

    const onEmailSubmit = async (data: EmailFormData) => {
        const { error } = await signIn(data.email);
        if (error) {
            toast.error(error.message);
        } else {
            setUserEmail(data.email);
            setStep('otp');
            toast.success('Verification link/code sent to your email');
        }
    };

    const onOtpSubmit = async (data: OtpFormData) => {
        const { error } = await verifyOtp(userEmail, data.otp);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Successfully logged in');
            setAuthModalOpen(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        const { error } = await signInWithOAuth(provider);
        if (error) {
            toast.error(`Failed to login with ${provider}`);
        }
    };

    return (
        <Modal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            size="md"
        >
            <div className="py-2 px-1">
                {/* Back Button for Email Steps */}
                {step !== 'selection' && (
                    <button
                        onClick={() => setStep(step === 'otp' ? 'email' : 'selection')}
                        className="absolute left-6 top-6 p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                )}

                <div className="text-center mb-8 space-y-2">
                    <h2 className="text-3xl font-serif font-bold tracking-tight text-neutral-900">
                        {step === 'selection' ? 'Welcome to Elysè' : step === 'email' ? 'Sign in with Email' : 'Verify your email'}
                    </h2>
                    <p className="text-sm text-neutral-500 max-w-[280px] mx-auto">
                        {step === 'selection'
                            ? 'Experience premium ethnic wear. Sign in to manage your orders and wishlist.'
                            : step === 'email'
                                ? 'Enter your email address to receive a secure login link or code.'
                                : `We've sent a 6-digit code to ${userEmail}`
                        }
                    </p>
                </div>

                {step === 'selection' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-neutral-200 hover:bg-neutral-50 transition-all rounded-none group shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#EA4335" d="M12 5.04c1.74 0 3.29.59 4.5 1.56l3.33-3.33C17.79 1.19 15.11 0 12 0 7.31 0 3.25 2.69 1.25 6.64l3.89 3.02C6.07 7.04 8.78 5.04 12 5.04z" />
                                <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.8 2.95c2.23-2.06 3.62-5.09 3.62-8.77z" />
                                <path fill="#34A853" d="M5.14 14.34c-.24-.72-.39-1.5-.39-2.34s.15-1.62.39-2.34l-3.89-3.02C.46 8.35 0 10.12 0 12s.46 3.65 1.25 5.36l3.89-3.02z" />
                                <path fill="#FBBC05" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.8-2.95c-1.08.75-2.45 1.21-4.13 1.21-3.22 0-5.93-2.02-6.91-4.81l-3.89 3.02C3.25 21.31 7.31 24 12 24z" />
                            </svg>
                            <span className="text-sm font-medium text-neutral-700">Continue with Google</span>
                        </button>

                        <button
                            onClick={() => handleSocialLogin('facebook')}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-[#1877F2] hover:bg-[#166FE5] transition-all rounded-none group shadow-sm"
                        >
                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span className="text-sm font-medium text-white">Continue with Facebook</span>
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-neutral-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                <span className="bg-white px-4 text-neutral-400">or</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('email')}
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 transition-all rounded-none group shadow-md"
                        >
                            <EnvelopeIcon className="h-5 w-5 text-neutral-400 group-hover:text-white transition-colors" />
                            <span className="text-sm font-medium text-white uppercase tracking-widest text-[10px]">Continue with Email</span>
                        </button>

                        <p className="text-[10px] text-neutral-400 text-center uppercase tracking-widest leading-relaxed mt-8">
                            No password required. Secure & fast.
                        </p>
                    </div>
                )}

                {step === 'email' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
                                </div>
                                <input
                                    {...emailForm.register('email')}
                                    type="email"
                                    placeholder="your@email.com"
                                    className="block w-full pl-11 pr-4 py-4 border border-neutral-200 rounded-none focus:ring-0 focus:border-neutral-900 text-sm transition-all bg-neutral-50 focus:bg-white"
                                />
                            </div>
                            {emailForm.formState.errors.email && (
                                <p className="text-xs text-red-500 font-medium">{emailForm.formState.errors.email.message}</p>
                            )}

                            <Button
                                type="submit"
                                className="w-full py-7 uppercase tracking-[0.2em] text-[10px] font-bold shadow-lg"
                                isLoading={isLoading}
                            >
                                Send Login Link
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                )}

                {step === 'otp' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <ShieldCheckIcon className="h-5 w-5 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
                                </div>
                                <input
                                    {...otpForm.register('otp')}
                                    type="text"
                                    maxLength={6}
                                    placeholder="0 0 0 0 0 0"
                                    className="block w-full pl-11 pr-4 py-4 border border-neutral-200 rounded-none focus:ring-0 focus:border-neutral-900 text-sm tracking-[1em] text-center font-mono bg-neutral-50 focus:bg-white"
                                />
                            </div>
                            {otpForm.formState.errors.otp && (
                                <p className="text-xs text-red-500 text-center font-medium">{otpForm.formState.errors.otp.message}</p>
                            )}

                            <Button
                                type="submit"
                                className="w-full py-7 uppercase tracking-[0.2em] text-[10px] font-bold shadow-lg"
                                isLoading={isLoading}
                            >
                                Verify & Access Account
                            </Button>
                        </form>

                        <div className="text-center mt-6">
                            <p className="text-xs text-neutral-500">
                                Didn't receive the code?{' '}
                                <button
                                    onClick={() => onEmailSubmit({ email: userEmail })}
                                    className="font-bold text-neutral-900 hover:underline underline-offset-4"
                                    disabled={isLoading}
                                >
                                    Resend
                                </button>
                            </p>
                            <p className="text-[10px] text-neutral-400 mt-2 italic px-8">
                                Check your spam folder if you don't see it in your inbox. Some providers might send a direct link instead.
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-12 pt-8 border-t border-neutral-100 text-center">
                    <p className="text-[9px] text-neutral-400 uppercase tracking-widest leading-loose font-medium">
                        Secure connection via Supabase Auth <br />
                        By continuing, you agree to our <span className="underline cursor-pointer hover:text-neutral-900">Terms</span> and <span className="underline cursor-pointer hover:text-neutral-900">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
