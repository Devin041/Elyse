'use client';

import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { ContactForm } from "@/components/sections/ContactForm";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
    const [settings, setSettings] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('landing_page_settings')
                    .select('*');

                if (data) {
                    const mapped = data.reduce((acc: any, item: any) => {
                        acc[item.key] = item.value;
                        return acc;
                    }, {});
                    setSettings(mapped);
                }
            } catch (error) {
                console.error('Error fetching contact settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Fallback values
    const address = settings.contact_address || "123 Premium Lane, Luxury Heights\nFashion District, Mumbai 400001";
    const phone = settings.contact_phone || "+91 98765 43210";
    const email = settings.contact_email || "concierge@elyse.com";
    const hours = settings.contact_hours || "Mon - Sat: 11:00 AM - 8:00 PM\nSun: By Appointment Only";
    const mapEmbed = settings.map_embed_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120678.02640228026!2d72.82563385!3d19.0194468!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b9ef80000001%3A0xbc91a4b4c4f3478d!2sGateway%20of%20India%20Mumbai!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";
    const mapRedirect = settings.map_redirect_url || "https://maps.google.com";

    return (
        <div className="bg-white pt-32 pb-20">
            <div className="container-premium">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4 block">Get In Touch</span>
                    <h1 className="text-5xl md:text-6xl font-serif text-gray-900 mb-6 italic">We'd love to hear from you.</h1>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Whether you have a question about our collections, need assistance with an order, or would like to schedule a private consultation, our team is here to assist you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Contact Information & Map */}
                    <div className="lg:col-span-5 space-y-12">
                        {/* Contact Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-gray-50 rounded-full">
                                    <MapPin className="h-5 w-5 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Our Boutique</h3>
                                    <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                        {address}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-gray-50 rounded-full">
                                    <Phone className="h-5 w-5 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Call Us</h3>
                                    <p className="text-gray-600 text-sm">{phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-gray-50 rounded-full">
                                    <Mail className="h-5 w-5 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Email Us</h3>
                                    <p className="text-gray-600 text-sm">{email}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-gray-50 rounded-full">
                                    <Clock className="h-5 w-5 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-2">Hours</h3>
                                    <div className="text-gray-600 text-sm whitespace-pre-wrap">{hours}</div>
                                </div>
                            </div>
                        </div>

                        {/* Map Integration */}
                        <div className="relative group w-full h-80 bg-gray-100 rounded-sm border border-gray-100 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                            <iframe
                                src={mapEmbed}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                className="filter grayscale hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>

                            {/* Overlay for Click-to-Redirect */}
                            <a
                                href={mapRedirect}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 bg-transparent flex items-center justify-center group-hover:bg-black/5 transition-colors cursor-pointer"
                                title="Open in Google Maps"
                            >
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center text-xs font-bold uppercase tracking-widest">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    View on Maps
                                    <ExternalLink className="h-3 w-3 ml-2 opacity-50" />
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-7">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
