'use client';

import { useState, useEffect } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, Save, Video, Image as ImageIcon, PenTool, User } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import VideoUploader from "@/components/VideoUploader";
import { cn } from "@/lib/utils";

// --- Types ---
interface AboutUsConfig {
    hero: {
        type: 'video' | 'image';
        mediaUrl: string;
        heading: string;
        subheading: string;
    };
    origin: {
        image: string;
        heading: string;
        description: string;
    };
    founder: {
        image: string;
        name: string;
        quote: string;
    };
    process: {
        image: string;
    }
}

const DEFAULT_CONFIG: AboutUsConfig = {
    hero: {
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1610189012906-4783fdae2c26?q=80&w=2070&auto=format&fit=crop',
        heading: 'Where Heritage Meets Horizon',
        subheading: "Elysè isn't just a label; it's a love letter to the modern Indian woman who carries her roots with pride and her ambitions with grace."
    },
    origin: {
        image: 'https://images.unsplash.com/photo-1583391733956-6c78b7b8ca84?q=80&w=1200&auto=format&fit=crop',
        heading: 'Born from a Dream',
        description: "It started with a simple observation: the gap between traditional grandeur and contemporary comfort. We saw women adjusting their dreams to fit heavy lehengas. We asked, \"Why can't the outfit adjust to her?\"\n\nThus, Elysè was born—to craft silhouettes that flow as freely as your spirit. We blend the intricate embroidery of the past with the breathable, wearable cuts of the present."
    },
    founder: {
        image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=800&auto=format&fit=crop',
        name: 'Aditi, Founder of Elysè',
        quote: "I wanted to create clothes that make you feel like the protagonist of your own life—powerful, poised, and unequivocally beautiful."
    },
    process: {
        image: 'https://images.unsplash.com/photo-1583391733958-e02376e9ced3?q=80&w=1200&auto=format&fit=crop'
    }
};

export default function AboutUsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [config, setConfig] = useState<AboutUsConfig>(DEFAULT_CONFIG);
    const [activeTab, setActiveTab] = useState<'hero' | 'origin' | 'founder' | 'process'>('hero');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/landing-page-settings');
            const settings = data.find((s: any) => s.key === 'about_us');
            if (settings?.value) {
                // Merge with default to ensure new fields exist
                setConfig({ ...DEFAULT_CONFIG, ...settings.value });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.post('/landing-page-settings', {
                key: 'about_us',
                value: config
            });
            toast.success('About Us page updated successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const updateConfig = (section: keyof AboutUsConfig, field: string, value: any) => {
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">About Us Page</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage content for the "Our Story" page</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'hero', label: 'Hero Section', icon: Video },
                        { id: 'origin', label: 'The Origin', icon: PenTool },
                        { id: 'founder', label: 'Founder Note', icon: User },
                        { id: 'process', label: 'Process Image', icon: ImageIcon },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                                    activeTab === tab.id
                                        ? "border-black text-black"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            <div className="animate-in fade-in duration-300">

                {/* HERO TAB */}
                {activeTab === 'hero' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                                <h3 className="font-semibold text-gray-900">Media Settings</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="mediaType"
                                                checked={config.hero.type === 'image'}
                                                onChange={() => updateConfig('hero', 'type', 'image')}
                                                className="h-4 w-4 text-black border-gray-300 focus:ring-black"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Image</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="mediaType"
                                                checked={config.hero.type === 'video'}
                                                onChange={() => updateConfig('hero', 'type', 'video')}
                                                className="h-4 w-4 text-black border-gray-300 focus:ring-black"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Video</span>
                                        </label>
                                    </div>
                                </div>

                                {config.hero.type === 'video' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video</label>
                                        <VideoUploader
                                            initialVideo={config.hero.mediaUrl}
                                            onVideoUploaded={(url) => updateConfig('hero', 'mediaUrl', url)}
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Recommended: MP4, WebM. Max 50MB.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                                        <ImageUploader
                                            maxImages={1}
                                            initialImages={config.hero.mediaUrl ? [config.hero.mediaUrl] : []}
                                            onImagesUploaded={(urls) => updateConfig('hero', 'mediaUrl', urls[0] || '')}
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Recommended: 1920x1080px Landscape.</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                                <h3 className="font-semibold text-gray-900">Text Content</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                                    <input
                                        type="text"
                                        value={config.hero.heading}
                                        onChange={(e) => updateConfig('hero', 'heading', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subheading</label>
                                    <textarea
                                        rows={3}
                                        value={config.hero.subheading}
                                        onChange={(e) => updateConfig('hero', 'subheading', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview (Simplistic) */}
                        <div className="bg-gray-100 rounded-lg p-4 border border-gray-200 flex items-center justify-center text-center">
                            <div className="max-w-sm">
                                <p className="text-sm font-semibold text-gray-500 mb-2">PREVIEW</p>
                                <div className="aspect-video bg-gray-200 rounded-md overflow-hidden relative">
                                    {config.hero.type === 'video' ? (
                                        <video src={config.hero.mediaUrl} className="w-full h-full object-cover" muted autoPlay loop />
                                    ) : (
                                        <img src={config.hero.mediaUrl} alt="Hero" className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <h2 className="text-white font-serif text-xl px-4">{config.hero.heading}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ORIGIN TAB */}
                {activeTab === 'origin' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                            <h3 className="font-semibold text-gray-900">Origin Story Details</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Origin Image (Sketch)</label>
                                <ImageUploader
                                    maxImages={1}
                                    initialImages={config.origin.image ? [config.origin.image] : []}
                                    onImagesUploaded={(urls) => updateConfig('origin', 'image', urls[0] || '')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                                <input
                                    type="text"
                                    value={config.origin.heading}
                                    onChange={(e) => updateConfig('origin', 'heading', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={6}
                                    value={config.origin.description}
                                    onChange={(e) => updateConfig('origin', 'description', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    placeholder="Enter your brand story here..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* FOUNDER TAB */}
                {activeTab === 'founder' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                            <h3 className="font-semibold text-gray-900">Founder Profile</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Founder Image</label>
                                <ImageUploader
                                    maxImages={1}
                                    initialImages={config.founder.image ? [config.founder.image] : []}
                                    onImagesUploaded={(urls) => updateConfig('founder', 'image', urls[0] || '')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name & Title</label>
                                <input
                                    type="text"
                                    value={config.founder.name}
                                    onChange={(e) => updateConfig('founder', 'name', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Personal Quote</label>
                                <textarea
                                    rows={4}
                                    value={config.founder.quote}
                                    onChange={(e) => updateConfig('founder', 'quote', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* PROCESS TAB */}
                {activeTab === 'process' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                            <h3 className="font-semibold text-gray-900">Process Visual</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Process Image ("Artisans working")</label>
                                <ImageUploader
                                    maxImages={1}
                                    initialImages={config.process.image ? [config.process.image] : []}
                                    onImagesUploaded={(urls) => updateConfig('process', 'image', urls[0] || '')}
                                />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div >
    );
}
