"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Mail, Save, ChevronLeft, ExternalLink, Info } from "lucide-react";
import { toast } from 'react-hot-toast';

export default function ContactSettingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [settings, setSettings] = useState({
        contact_address: "",
        contact_phone: "",
        contact_email: "",
        contact_hours: "",
        map_embed_url: "",
        map_redirect_url: ""
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/landing-page-settings');
                const result = await response.json();
                if (result.success) {
                    setSettings({
                        contact_address: result.data.contact_address || "",
                        contact_phone: result.data.contact_phone || "",
                        contact_email: result.data.contact_email || "",
                        contact_hours: result.data.contact_hours || "",
                        map_embed_url: result.data.map_embed_url || "",
                        map_redirect_url: result.data.map_redirect_url || ""
                    });
                }
            } catch (error) {
                console.error('Error fetching contact settings:', error);
                toast.error("Failed to load settings");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save each setting
            const promises = Object.entries(settings).map(([key, value]) =>
                fetch('/api/landing-page-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, value })
                })
            );

            await Promise.all(promises);
            toast.success("Contact settings saved successfully");
        } catch (error) {
            console.error('Error saving contact settings:', error);
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Contact & Map Settings</h1>
                        <p className="text-sm text-gray-500">Manage your store's physical presence and contact info</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Phone className="h-5 w-5 mr-2 text-blue-600" />
                            General Contact
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                                    value={settings.contact_address}
                                    onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                                    placeholder="123 Premium Lane..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value={settings.contact_phone}
                                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value={settings.contact_email}
                                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                    placeholder="concierge@elyse.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value={settings.contact_hours}
                                    onChange={(e) => setSettings({ ...settings, contact_hours: e.target.value })}
                                    placeholder="Mon - Sat: 11:00 AM - 8:00 PM"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Settings */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <MapPin className="h-5 w-5 mr-2 text-red-600" />
                            Google Maps Integration
                        </h2>

                        <div className="bg-blue-50 p-4 rounded-md mb-4 flex items-start">
                            <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                            <div className="text-xs text-blue-700 space-y-1">
                                <p><strong>How to get Embed URL:</strong></p>
                                <ol className="list-decimal ml-4">
                                    <li>Go to Google Maps</li>
                                    <li>Search for your location</li>
                                    <li>Click <strong>Share</strong> &gt; <strong>Embed a map</strong></li>
                                    <li>Copy only the URL inside <code>src="..."</code></li>
                                </ol>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                                    Embed URL
                                    {settings.map_embed_url && (
                                        <a href={settings.map_embed_url} target="_blank" className="text-blue-600 hover:text-blue-800 flex items-center">
                                            <ExternalLink className="h-3 w-3 mr-1" /> Test
                                        </a>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value={settings.map_embed_url}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        // Auto-extract src if they paste the whole iframe tag
                                        if (val.includes('<iframe')) {
                                            const match = val.match(/src="([^"]+)"/);
                                            if (match && match[1]) {
                                                val = match[1];
                                            }
                                        }
                                        setSettings({ ...settings, map_embed_url: val });
                                    }}
                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Google Maps Direct Link (Redirect)
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value={settings.map_redirect_url}
                                    onChange={(e) => setSettings({ ...settings, map_redirect_url: e.target.value })}
                                    placeholder="https://goo.gl/maps/..."
                                />
                                <p className="mt-1 text-xs text-gray-500 italic">This is the link used when a user clicks on the map.</p>
                            </div>

                            {/* Preview */}
                            <div className="mt-6 border-t pt-6">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Live Preview</h3>
                                <div className="w-full h-40 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
                                    {settings.map_embed_url ? (
                                        <iframe
                                            src={settings.map_embed_url}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                        ></iframe>
                                    ) : (
                                        <div className="text-gray-400 text-xs flex flex-col items-center">
                                            <MapPin className="h-8 w-8 mb-2 opacity-20" />
                                            No map URL provided
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
