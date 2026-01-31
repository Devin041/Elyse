"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye, Phone, Mail, MessageCircle, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentCTASchema } from '@/lib/validations/landingPage';
import { toast } from 'react-hot-toast';
import type { z } from 'zod';
import ImageUploader from "@/components/ImageUploader";

type AppointmentCTAFormData = z.infer<typeof appointmentCTASchema>;

export default function AppointmentCTAPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [useCustomLink, setUseCustomLink] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
        reset,
    } = useForm<AppointmentCTAFormData>({
        resolver: zodResolver(appointmentCTASchema),
        defaultValues: {
            heading: "",
            subheading: "",
            ctaText: "",
            contactMethod: 'whatsapp',
            contactValue: '',
            backgroundColor: "",
            backgroundImageUrl: "",
            textColor: "#FFFFFF",
            buttonColor: "",
            buttonTextColor: "",
            isEnabled: true
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/landing-page/appointment-cta');
                if (!res.ok) throw new Error('Failed to fetch appointment CTA');
                const data = await res.json();

                if (data) {
                    // Determine contact method and value from data
                    let contactMethod = 'whatsapp';
                    let contactValue = '';

                    if (data.whatsapp_number) {
                        contactMethod = 'whatsapp';
                        contactValue = data.whatsapp_number;
                    } else if (data.phone_number) {
                        contactMethod = 'phone';
                        contactValue = data.phone_number;
                    } else if (data.config?.email) {
                        contactMethod = 'email';
                        contactValue = data.config.email;
                    } else if (data.config?.link) {
                        contactMethod = 'link';
                        contactValue = data.config.link;
                    }

                    reset({
                        heading: data.title,
                        subheading: data.description,
                        ctaText: data.cta_text,
                        contactMethod: data.config?.contactMethod || contactMethod,
                        contactValue: contactValue,
                        isEnabled: data.is_enabled,
                        // Config fields
                        backgroundColor: data.config?.backgroundColor || "#F3F4F6",
                        backgroundImageUrl: data.config?.backgroundImageUrl || "",
                        textColor: data.config?.textColor || "#111827",
                        buttonColor: data.config?.buttonColor || "#10B981",
                        buttonTextColor: data.config?.buttonTextColor || "#FFFFFF",
                    });
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load appointment CTA");
            } finally {
                setIsLoading(false);
            }
        };

        const fetchOptions = async () => {
            try {
                const [catsRes, colsRes] = await Promise.all([
                    fetch('/api/categories?includeInactive=true'),
                    fetch('/api/collections')
                ]);

                if (catsRes.ok) {
                    const catsData = await catsRes.json();
                    setCategories(catsData.data || []);
                }

                if (colsRes.ok) {
                    const colsData = await colsRes.json();
                    setCollections(colsData.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch link options:', error);
            }
        };

        fetchData();
        fetchOptions();
    }, [reset]);

    // Watch values for preview
    const formData = watch();

    const onSubmit = async (data: AppointmentCTAFormData) => {
        try {
            const payload = {
                title: data.heading || "",
                description: data.subheading || "",
                cta_text: data.ctaText,
                phone_number: data.contactMethod === 'phone' ? data.contactValue : "",
                whatsapp_number: data.contactMethod === 'whatsapp' ? data.contactValue : "",
                is_enabled: data.isEnabled,
                config: {
                    contactMethod: data.contactMethod,
                    email: data.contactMethod === 'email' ? data.contactValue : "",
                    link: data.contactMethod === 'link' ? data.contactValue : "",
                    backgroundColor: data.backgroundColor,
                    backgroundImageUrl: data.backgroundImageUrl,
                    textColor: data.textColor,
                    buttonColor: data.buttonColor,
                    buttonTextColor: data.buttonTextColor
                }
            };

            const res = await fetch('/api/landing-page/appointment-cta', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                const message = errorData.message || errorData.error || 'Failed to update CTA';
                throw new Error(message);
            }

            toast.success("Appointment CTA saved successfully!");
        } catch (error: any) {
            console.error('Update appointment CTA error:', error);

            // Try to extract detailed error message from response
            let detailedError = "Failed to save changes. Please try again.";
            try {
                if (error.response) {
                    const data = await error.response.json();
                    detailedError = data.message || data.error || detailedError;
                }
            } catch (e) { }

            toast.error(detailedError);
        }
    };

    const getContactIcon = (method: string) => {
        switch (method) {
            case 'whatsapp': return MessageCircle;
            case 'phone': return Phone;
            case 'email': return Mail;
            case 'link': return LinkIcon;
            default: return MessageCircle;
        }
    };

    const getPlaceholder = (method: string) => {
        switch (method) {
            case 'whatsapp': return '+91 9876543210';
            case 'phone': return '+91 9876543210';
            case 'email': return 'contact@elyse.com';
            case 'link': return 'https://calendly.com/elyse';
            default: return '';
        }
    };

    const ContactIcon = getContactIcon(formData.contactMethod || 'whatsapp');

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/landing-page"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Landing Page
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Appointment CTA Section
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Encourage customers to book appointments
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="button" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Content */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Heading
                                </label>
                                <input
                                    type="text"
                                    {...register("heading")}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.heading ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., Book Your Appointment (Optional)"
                                />
                                {errors.heading && (
                                    <p className="text-red-500 text-sm mt-1">{errors.heading.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subheading
                                </label>
                                <textarea
                                    {...register("subheading")}
                                    rows={2}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.subheading ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Describe the benefits of booking..."
                                />
                                {errors.subheading && (
                                    <p className="text-red-500 text-sm mt-1">{errors.subheading.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Button Text <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("ctaText")}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.ctaText ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., Contact Us, Book Now"
                                />
                                {errors.ctaText && (
                                    <p className="text-red-500 text-sm mt-1">{errors.ctaText.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Configuration */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Method</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Method <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{
                                            borderColor: formData.contactMethod === 'whatsapp' ? '#10B981' : '#D1D5DB'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            value="whatsapp"
                                            {...register("contactMethod")}
                                            className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                                        />
                                        <MessageCircle className="h-5 w-5 mx-2 text-green-600" />
                                        <span className="text-sm font-medium text-gray-700">WhatsApp</span>
                                    </label>

                                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{
                                            borderColor: formData.contactMethod === 'phone' ? '#3B82F6' : '#D1D5DB'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            value="phone"
                                            {...register("contactMethod")}
                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <Phone className="h-5 w-5 mx-2 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-700">Phone</span>
                                    </label>

                                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{
                                            borderColor: formData.contactMethod === 'email' ? '#EF4444' : '#D1D5DB'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            value="email"
                                            {...register("contactMethod")}
                                            className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                                        />
                                        <Mail className="h-5 w-5 mx-2 text-red-600" />
                                        <span className="text-sm font-medium text-gray-700">Email</span>
                                    </label>

                                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{
                                            borderColor: formData.contactMethod === 'link' ? '#8B5CF6' : '#D1D5DB'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            value="link"
                                            {...register("contactMethod")}
                                            className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                        />
                                        <LinkIcon className="h-5 w-5 mx-2 text-purple-600" />
                                        <span className="text-sm font-medium text-gray-700">Custom Link</span>
                                    </label>
                                </div>
                            </div>

                            {formData.contactMethod === 'link' ? (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Booking Link <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setUseCustomLink(!useCustomLink)}
                                            className="text-xs text-blue-600 hover:text-blue-500"
                                        >
                                            {useCustomLink ? "Select from list" : "Enter custom URL"}
                                        </button>
                                    </div>
                                    {useCustomLink ? (
                                        <input
                                            type="text"
                                            {...register("contactValue")}
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.contactValue ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="https://calendly.com/elyse"
                                        />
                                    ) : (
                                        <select
                                            {...register("contactValue")}
                                            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.contactValue ? 'border-red-500' : 'border-gray-300'}`}
                                        >
                                            <option value="">Select a page</option>
                                            <optgroup label="General">
                                                <option value="/contact">Contact Us Page</option>
                                                <option value="/about">About Us</option>
                                                <option value="/gift-cards">Gift Cards</option>
                                            </optgroup>
                                            <optgroup label="Collections">
                                                {collections.map(col => (
                                                    <option key={col.id} value={`/collections/${col.slug}`}>
                                                        {col.name} (/collections/{col.slug})
                                                    </option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="Categories">
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={`/collections/${cat.slug}`}>
                                                        {cat.name} (/collections/{cat.slug})
                                                    </option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {formData.contactMethod === 'whatsapp' && 'WhatsApp Number'}
                                        {formData.contactMethod === 'phone' && 'Phone Number'}
                                        {formData.contactMethod === 'email' && 'Email Address'}
                                        {' '}<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register("contactValue")}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.contactValue ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder={getPlaceholder(formData.contactMethod || 'whatsapp')}
                                    />
                                </>
                            )}

                            {errors.contactValue && (
                                <p className="text-red-500 text-sm mt-1">{errors.contactValue.message}</p>
                            )}
                            {formData.contactMethod === 'whatsapp' && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Include country code (e.g., +91 for India)
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Colors & Background */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Background</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Background Image
                                </label>
                                <ImageUploader
                                    onImagesUploaded={(urls) => setValue("backgroundImageUrl", urls[0])}
                                    maxImages={1}
                                    initialImages={formData.backgroundImageUrl ? [formData.backgroundImageUrl] : []}
                                    aspectRatio={16 / 5}
                                    cropTitle="Crop Banner Image"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Background Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.backgroundColor || "#F3F4F6"}
                                            onChange={(e) => setValue("backgroundColor", e.target.value.toUpperCase())}
                                            className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            {...register("backgroundColor")}
                                            className={`flex-1 px-3 py-2 border rounded-md text-sm ${errors.backgroundColor ? 'border-red-500' : 'border-gray-300'}`}
                                            onChange={(e) => setValue("backgroundColor", e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    {errors.backgroundColor && (
                                        <p className="text-red-500 text-sm mt-1">{errors.backgroundColor.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Text Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.textColor || "#111827"}
                                            onChange={(e) => setValue("textColor", e.target.value.toUpperCase())}
                                            className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            {...register("textColor")}
                                            className={`flex-1 px-3 py-2 border rounded-md text-sm ${errors.textColor ? 'border-red-500' : 'border-gray-300'}`}
                                            onChange={(e) => setValue("textColor", e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    {errors.textColor && (
                                        <p className="text-red-500 text-sm mt-1">{errors.textColor.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Button Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.buttonColor || "#10B981"}
                                            onChange={(e) => setValue("buttonColor", e.target.value.toUpperCase())}
                                            className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            {...register("buttonColor")}
                                            className={`flex-1 px-3 py-2 border rounded-md text-sm ${errors.buttonColor ? 'border-red-500' : 'border-gray-300'}`}
                                            onChange={(e) => setValue("buttonColor", e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    {errors.buttonColor && (
                                        <p className="text-red-500 text-sm mt-1">{errors.buttonColor.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Button Text Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.buttonTextColor || "#FFFFFF"}
                                            onChange={(e) => setValue("buttonTextColor", e.target.value.toUpperCase())}
                                            className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            {...register("buttonTextColor")}
                                            className={`flex-1 px-3 py-2 border rounded-md text-sm ${errors.buttonTextColor ? 'border-red-500' : 'border-gray-300'}`}
                                            onChange={(e) => setValue("buttonTextColor", e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    {errors.buttonTextColor && (
                                        <p className="text-red-500 text-sm mt-1">{errors.buttonTextColor.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>

                        <div
                            className="rounded-lg p-12 text-center bg-cover bg-center bg-no-repeat relative overflow-hidden"
                            style={{
                                backgroundColor: formData.backgroundColor,
                                backgroundImage: formData.backgroundImageUrl ? `url(${formData.backgroundImageUrl})` : 'none'
                            }}
                        >
                            {/* Overlay removed to match storefront 4K quality */}
                            <div className="relative z-10">
                                {formData.heading && (
                                    <h2
                                        className="text-3xl font-bold mb-2 uppercase tracking-wider"
                                        style={{ color: formData.textColor, letterSpacing: '2px' }}
                                    >
                                        {formData.heading}
                                    </h2>
                                )}
                                {formData.subheading && (
                                    <p
                                        className="text-md mb-6 max-w-2xl mx-auto font-light italic"
                                        style={{ color: formData.textColor, opacity: 0.9 }}
                                    >
                                        {formData.subheading}
                                    </p>
                                )}
                                <button
                                    className="inline-flex items-center rounded-sm font-semibold transition-all duration-500 backdrop-blur-sm shadow-xl"
                                    style={{
                                        backgroundColor: formData.buttonColor || 'transparent',
                                        color: (formData.buttonTextColor && formData.buttonTextColor !== '') ? formData.buttonTextColor : '#FFFFFF',
                                        borderColor: (formData.buttonTextColor && formData.buttonTextColor !== '') ? formData.buttonTextColor : 'rgba(255, 255, 255, 0.8)',
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        padding: '16px 42px',
                                        letterSpacing: '2px',
                                        textTransform: 'uppercase',
                                        fontSize: '13px'
                                    }}
                                >
                                    <ContactIcon className="h-5 w-5 mr-3" />
                                    {formData.ctaText || "Button"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Settings */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>

                        <div className="space-y-4">
                            <div className="pt-4 border-t border-gray-200">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        {...register("isEnabled")}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        Enable this section
                                    </span>
                                </label>
                                <p className="ml-6 text-xs text-gray-500 mt-1">
                                    Disabled sections won't be shown on the landing page
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">Contact Method Info</h3>
                        <div className="text-xs text-blue-800 space-y-1">
                            <p><strong>WhatsApp:</strong> Opens WhatsApp chat</p>
                            <p><strong>Phone:</strong> Triggers phone call</p>
                            <p><strong>Email:</strong> Opens email client</p>
                            <p><strong>Link:</strong> Direct to booking page</p>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
