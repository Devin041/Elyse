'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Send, Loader2 } from 'lucide-react';

const inquirySchema = z.object({
    name: z.string().min(1, "Full name is required").max(100, "Name too long"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(1, "Subject is required").max(100, "Subject too long"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

export function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<InquiryFormData>({
        resolver: zodResolver(inquirySchema),
    });

    const onSubmit = async (data: InquiryFormData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Failed to submit inquiry');

            toast.success("Thank you! Your message has been sent successfully.");
            reset();
        } catch (error) {
            console.error(error);
            toast.error("Failed to send message. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 md:p-12 shadow-sm border border-gray-100 rounded-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                        Full Name
                    </label>
                    <input
                        id="name"
                        {...register('name')}
                        className={`w-full px-4 py-3 bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-none focus:outline-none focus:border-black transition-colors text-sm`}
                        placeholder="Aditya Joshi"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                        Email Address
                    </label>
                    <input
                        id="email"
                        {...register('email')}
                        className={`w-full px-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-none focus:outline-none focus:border-black transition-colors text-sm`}
                        placeholder="aditya@example.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="subject" className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                    Subject
                </label>
                <input
                    id="subject"
                    {...register('subject')}
                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.subject ? 'border-red-500' : 'border-gray-200'} rounded-none focus:outline-none focus:border-black transition-colors text-sm`}
                    placeholder="Inquiry about custom piece"
                />
                {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
            </div>

            <div>
                <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                    Message
                </label>
                <textarea
                    id="message"
                    rows={6}
                    {...register('message')}
                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.message ? 'border-red-500' : 'border-gray-200'} rounded-none focus:outline-none focus:border-black transition-colors text-sm resize-none`}
                    placeholder="How can we help you?"
                />
                {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        Send Message
                        <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                )}
            </button>
        </form>
    );
}
