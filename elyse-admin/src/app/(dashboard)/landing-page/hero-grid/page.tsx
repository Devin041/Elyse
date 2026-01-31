"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, Save, Plus, Trash2, Link as LinkIcon, GripVertical, Check, LayoutGrid, Menu as MenuIcon } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import { cn } from "@/lib/utils";

// --- Hero Grid Interfaces ---
interface HeroGridItem {
    id: string;
    title: string;
    image: string;
    link: string;
    textAlign?: 'start' | 'center' | 'end';
}

interface HeroGridConfig {
    sectionTitle?: string;
    description?: string;
    pattern: 'equal' | 'featured' | 'alternating';
    overlayDarkness: number;
    ctaText: string;
    items: HeroGridItem[];
}

// --- Mega Menu Interfaces ---
interface MegaMenuCard {
    id: string;
    title: string;
    image: string;
    link: string;
}

interface MegaMenuConfig {
    sidebarCategories: string[]; // List of category IDs or Slugs
    visualCards: MegaMenuCard[];
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

// --- Defaults ---
const DEFAULT_HERO_CONFIG: HeroGridConfig = {
    sectionTitle: '',
    description: '',
    pattern: 'equal',
    overlayDarkness: 60,
    ctaText: 'EXPLORE',
    items: [
        { id: '1', title: 'SHOP FAVORITES', image: '', link: '/collections/favorites', textAlign: 'start' },
        { id: '2', title: 'SHOP BESTSELLERS', image: '', link: '/collections/bestsellers', textAlign: 'start' },
        { id: '3', title: 'SHOP ALL', image: '', link: '/collections/all', textAlign: 'start' },
        { id: '4', title: 'OUR STORY', image: '', link: '/pages/about', textAlign: 'start' },
    ],
};

const DEFAULT_MEGA_MENU_CONFIG: MegaMenuConfig = {
    sidebarCategories: [],
    visualCards: [
        { id: '1', title: 'SHOP FAVORITES >', image: '', link: '/collections/favorites' },
        { id: '2', title: 'SHOP BESTSELLERS >', image: '', link: '/collections/bestsellers' },
        { id: '3', title: 'SHOP ALL >', image: '', link: '/collections/all' },
        { id: '4', title: 'OUR STORY >', image: '', link: '/about' },
    ],
};

export default function HeroGridPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [collections, setCollections] = useState<any[]>([]);

    // Config State
    const [heroConfig, setHeroConfig] = useState<HeroGridConfig>(DEFAULT_HERO_CONFIG);
    const [megaMenuConfig, setMegaMenuConfig] = useState<MegaMenuConfig>(DEFAULT_MEGA_MENU_CONFIG);

    // UI State
    const [activeTab, setActiveTab] = useState<'hero' | 'mega-menu'>('hero');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [settingsRes, categoriesRes, collectionsRes] = await Promise.all([
                api.get('/landing-page-settings'),
                api.get('/categories'),
                api.get('/collections')
            ]);

            if (categoriesRes.data.success) {
                setCategories(categoriesRes.data.data);
            }

            if (collectionsRes.data.success) {
                setCollections(collectionsRes.data.data);
            }

            if (settingsRes.data.success) {
                const savedHero = settingsRes.data.data.hero_grid;
                const savedMegaMenu = settingsRes.data.data.mega_menu;

                if (savedHero) {
                    if (Array.isArray(savedHero)) {
                        setHeroConfig({
                            ...DEFAULT_HERO_CONFIG,
                            items: savedHero.map(item => ({ ...item, textAlign: item.textAlign || 'start' }))
                        });
                    } else {
                        setHeroConfig({ ...DEFAULT_HERO_CONFIG, ...savedHero });
                    }
                }

                if (savedMegaMenu) {
                    setMegaMenuConfig({ ...DEFAULT_MEGA_MENU_CONFIG, ...savedMegaMenu });
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all([
                api.post('/landing-page-settings', {
                    key: 'hero_grid',
                    value: heroConfig
                }),
                api.post('/landing-page-settings', {
                    key: 'mega_menu',
                    value: megaMenuConfig
                })
            ]);
            toast.success("All settings saved successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    // --- Hero Grid Helpers ---
    const updateHeroConfig = (field: keyof HeroGridConfig, value: any) => {
        setHeroConfig(prev => ({ ...prev, [field]: value }));
    };

    const updateHeroItem = (index: number, field: keyof HeroGridItem, value: any) => {
        const newItems = [...heroConfig.items];
        newItems[index] = { ...newItems[index], [field]: value };
        updateHeroConfig('items', newItems);
    };

    const addHeroItem = () => {
        if (heroConfig.items.length >= 6) return toast.error("Maximum 6 items allowed");
        const newItem: HeroGridItem = {
            id: Date.now().toString(),
            title: 'New Item',
            image: '',
            link: '',
            textAlign: 'start'
        };
        updateHeroConfig('items', [...heroConfig.items, newItem]);
    };

    const removeHeroItem = (index: number) => {
        if (heroConfig.items.length <= 2) return toast.error("Minimum 2 items required");
        updateHeroConfig('items', heroConfig.items.filter((_, i) => i !== index));
    };

    // --- Mega Menu Helpers ---
    const toggleSidebarCategory = (slug: string) => {
        setMegaMenuConfig(prev => {
            const exists = prev.sidebarCategories.includes(slug);
            const newCategories = exists
                ? prev.sidebarCategories.filter(s => s !== slug)
                : [...prev.sidebarCategories, slug];
            return { ...prev, sidebarCategories: newCategories };
        });
    };

    const updateMegaMenuCard = (index: number, field: keyof MegaMenuCard, value: any) => {
        const newCards = [...megaMenuConfig.visualCards];
        newCards[index] = { ...newCards[index], [field]: value };
        setMegaMenuConfig(prev => ({ ...prev, visualCards: newCards }));
    };

    const LinkSelector = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
        const [isCustom, setIsCustom] = useState(() => {
            // Check if value is one of the standard options
            const isStandard = [
                '/gift-cards', '/about', '/contact', '/blog', '/collections/all', '/collections/favorites', '/collections/bestsellers'
            ].includes(value) ||
                categories.some(c => `/collections/${c.slug}` === value) ||
                collections.some(c => `/collections/${c.slug}` === value);

            return value !== '' && !isStandard;
        });

        return (
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Link</label>
                    <button
                        type="button"
                        onClick={() => setIsCustom(!isCustom)}
                        className="text-[10px] text-blue-600 hover:text-blue-500 font-bold"
                    >
                        {isCustom ? "LIST" : "CUSTOM"}
                    </button>
                </div>
                {isCustom ? (
                    <div className="flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                            <LinkIcon className="h-3 w-3" />
                        </span>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="/custom-link"
                        />
                    </div>
                ) : (
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="">Select a page</option>
                        <optgroup label="General">
                            <option value="/collections/all">Shop All</option>
                            <option value="/collections/favorites">Favorites</option>
                            <option value="/collections/bestsellers">Best Sellers</option>
                            <option value="/gift-cards">Gift Cards</option>
                        </optgroup>
                        <optgroup label="Collections">
                            {collections.map(col => (
                                <option key={col.id} value={`/collections/${col.slug}`}>
                                    {col.name}
                                </option>
                            ))}
                        </optgroup>
                        <optgroup label="Categories">
                            {categories.map(cat => (
                                <option key={cat.id} value={`/collections/${cat.slug}`}>
                                    {cat.name}
                                </option>
                            ))}
                        </optgroup>
                        <optgroup label="Other">
                            <option value="/about">About Us</option>
                            <option value="/contact">Contact Us</option>
                            <option value="/blog">Blog</option>
                        </optgroup>
                    </select>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Homepage Layout & Navigation</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage your Hero Mosaic and Mega Menu navigation content.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save All Changes
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('hero')}
                        className={cn(
                            activeTab === 'hero'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm'
                        )}
                    >
                        <LayoutGrid className={cn("mr-2 h-5 w-5", activeTab === 'hero' ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500")} />
                        Hero Mosaic
                    </button>
                    <button
                        onClick={() => setActiveTab('mega-menu')}
                        className={cn(
                            activeTab === 'mega-menu'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm'
                        )}
                    >
                        <MenuIcon className={cn("mr-2 h-5 w-5", activeTab === 'mega-menu' ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500")} />
                        Mega Menu
                    </button>
                </nav>
            </div>

            {/* Content: Hero Mosaic */}
            {activeTab === 'hero' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Section Settings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                                <input
                                    type="text"
                                    value={heroConfig.sectionTitle}
                                    onChange={(e) => updateHeroConfig('sectionTitle', e.target.value)}
                                    placeholder="e.g., COLLECTIONS WE LOVE"
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={heroConfig.description}
                                    onChange={(e) => updateHeroConfig('description', e.target.value)}
                                    placeholder="e.g., Discover the latest in premium ethnic wear"
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Layout Pattern</label>
                                <select
                                    value={heroConfig.pattern}
                                    onChange={(e) => updateHeroConfig('pattern', e.target.value)}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="equal">Equal Grid</option>
                                    <option value="featured">Featured (1 Large)</option>
                                    <option value="alternating">Alternating</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Overlay Darkness ({heroConfig.overlayDarkness}%)</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="80"
                                    value={heroConfig.overlayDarkness}
                                    onChange={(e) => updateHeroConfig('overlayDarkness', Number(e.target.value))}
                                    className="block w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                                <input
                                    type="text"
                                    value={heroConfig.ctaText}
                                    onChange={(e) => updateHeroConfig('ctaText', e.target.value)}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Grid Items ({heroConfig.items.length}/6)</h2>
                            <button
                                onClick={addHeroItem}
                                disabled={heroConfig.items.length >= 6}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {heroConfig.items.map((item, index) => (
                                <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
                                    <div className="aspect-[3/4] bg-gray-100 relative group">
                                        <ImageUploader
                                            maxImages={1}
                                            initialImages={item.image ? [item.image] : []}
                                            onImagesUploaded={(urls: string[]) => updateHeroItem(index, 'image', urls[0] || '')}
                                        />
                                    </div>
                                    <div className="p-4 space-y-3 flex-1">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => updateHeroItem(index, 'title', e.target.value)}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <LinkSelector
                                            value={item.link}
                                            onChange={(val) => updateHeroItem(index, 'link', val)}
                                        />
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Align</label>
                                            <select
                                                value={item.textAlign}
                                                onChange={(e) => updateHeroItem(index, 'textAlign', e.target.value)}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            >
                                                <option value="start">Left</option>
                                                <option value="center">Center</option>
                                                <option value="end">Right</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => removeHeroItem(index)}
                                            disabled={heroConfig.items.length <= 2}
                                            className="w-full inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Content: Mega Menu */}
            {activeTab === 'mega-menu' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                    {/* Left: Category Selector */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sidebar Categories</h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Select categories to display in the "Shop by Style" sidebar.
                            </p>

                            <div className="flex-1 overflow-y-auto max-h-[600px] space-y-2 pr-2 border-t border-gray-100 pt-4">
                                {categories.length === 0 ? (
                                    <p className="text-sm text-gray-500">No categories found.</p>
                                ) : categories.map((cat) => {
                                    const isSelected = megaMenuConfig.sidebarCategories.includes(cat.slug);
                                    return (
                                        <div
                                            key={cat.id}
                                            onClick={() => toggleSidebarCategory(cat.slug)}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors text-sm",
                                                isSelected ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"
                                            )}
                                        >
                                            <span className={cn(isSelected ? "font-medium text-blue-700" : "text-gray-700")}>
                                                {cat.name}
                                            </span>
                                            {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Visual Cards */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Visual Menu Cards</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Update the 4 visual tiles that appear in the Mega Menu dropdown.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {megaMenuConfig.visualCards.map((card, index) => (
                                    <div key={card.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                        <div className="aspect-[3/4] bg-gray-100 relative group">
                                            <ImageUploader
                                                maxImages={1}
                                                initialImages={card.image ? [card.image] : []}
                                                onImagesUploaded={(urls: string[]) => updateMegaMenuCard(index, 'image', urls[0] || '')}
                                            />
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    value={card.title}
                                                    onChange={(e) => updateMegaMenuCard(index, 'title', e.target.value)}
                                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                            <LinkSelector
                                                value={card.link}
                                                onChange={(val) => updateMegaMenuCard(index, 'link', val)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
