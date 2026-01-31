"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import {
    Image as ImageIcon,
    Type,
    Gift,
    Calendar,
    ShoppingBag,
    Sparkles,
    FileText,
    Plus,
    Eye,
    Save,
    GripVertical,
    MapPin
} from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Section {
    id: string;
    name: string;
    type: string;
    icon: any;
    isEnabled: boolean;
    href: string;
}

function SortableSection({ section, index }: { section: Section; index: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : 0,
    };

    const Icon = section.icon;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="px-6 py-4 hover:bg-gray-50 transition-colors group bg-white"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                    {/* Drag Handle */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-move text-gray-400 hover:text-gray-600 touch-none"
                    >
                        <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Section Number */}
                    <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 font-semibold text-sm">
                            {index + 1}
                        </span>
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>

                    {/* Section Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                            {section.name}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">
                            {section.type.replace('-', ' ')}
                        </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                        {section.isEnabled ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Enabled
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Disabled
                            </span>
                        )}
                    </div>
                </div>

                {/* Edit Button */}
                <div className="ml-4">
                    <Link
                        href={section.href}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Edit
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LandingPageManagementPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await fetch('/api/landing-page/hero-sections');
                const heroes = await response.json();

                const mappedHeroes = Array.isArray(heroes) ? heroes.map((hero: any) => ({
                    id: hero.id,
                    name: hero.title ? `Hero Section (${hero.title})` : 'Hero Section',
                    type: "hero",
                    icon: ImageIcon,
                    isEnabled: hero.is_enabled ?? true,
                    href: `/landing-page/hero-sections/${hero.id}`
                })) : [];

                const otherSections: Section[] = [
                    {
                        id: "occasions",
                        name: "Shop by Occasion",
                        type: "occasions",
                        icon: ShoppingBag,
                        isEnabled: true,
                        href: "/landing-page/occasions"
                    },
                    {
                        id: "handpicked",
                        name: "Handpicked Styles",
                        type: "product-section",
                        icon: Sparkles,
                        isEnabled: true,
                        href: "/landing-page/product-sections/handpicked"
                    },
                    {
                        id: "carousel",
                        name: "Product Carousel (ELYSÈ FESTIVE WEAR)",
                        type: "carousel",
                        icon: ShoppingBag,
                        isEnabled: true,
                        href: "/landing-page/carousel"
                    },
                    {
                        id: "brand-story",
                        name: "Brand Story",
                        type: "brand-story",
                        icon: Type,
                        isEnabled: true,
                        href: "/landing-page/brand-story"
                    },
                    {
                        id: "best-sellers",
                        name: "Best Sellers",
                        type: "product-section",
                        icon: Sparkles,
                        isEnabled: true,
                        href: "/landing-page/product-sections/best-sellers"
                    },
                    {
                        id: "gift-cards",
                        name: "Gift Cards Banner",
                        type: "promotional",
                        icon: Gift,
                        isEnabled: true,
                        href: "/landing-page/promotional/gift-cards"
                    },
                    {
                        id: "appointment",
                        name: "Appointment CTA",
                        type: "promotional",
                        icon: Calendar,
                        isEnabled: true,
                        href: "/landing-page/promotional/appointment"
                    },
                    {
                        id: "blog",
                        name: "Blog Section (Good Reads)",
                        type: "blog",
                        icon: FileText,
                        isEnabled: true,
                        href: "/landing-page/blog"
                    },
                    {
                        id: "contact",
                        name: "Contact & Location",
                        type: "general",
                        icon: MapPin,
                        isEnabled: true,
                        href: "/landing-page/contact"
                    },
                    {
                        id: "hero-grid",
                        name: "Hero Grid (Shop Favorites, Bestsellers...)",
                        type: "hero-grid",
                        icon: ImageIcon,
                        isEnabled: true,
                        href: "/landing-page/hero-grid"
                    },
                    {
                        id: "about-us",
                        name: "About Us Page",
                        type: "general",
                        icon: FileText,
                        isEnabled: true,
                        href: "/landing-page/about"
                    }
                ];

                // Combine: Heroes first, then others
                setSections([...mappedHeroes, ...otherSections]);
            } catch (error) {
                console.error('Error fetching sections:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSections();
    }, []);


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Landing Page Management</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage all sections of your store's landing page
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                            How to manage your landing page
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <p>Click on any section below to edit its content. Changes will be reflected on your store's homepage in real-time.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sections List */}
            <div className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Landing Page Sections</h2>
                    <p className="mt-1 text-sm text-gray-500">Drag and drop to reorder sections</p>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sections.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="divide-y divide-gray-200 min-h-[100px] flex flex-col">
                            {isLoading ? (
                                <div className="flex-1 flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : sections.length > 0 ? (
                                sections.map((section, index) => (
                                    <SortableSection
                                        key={section.id}
                                        section={section}
                                        index={index}
                                    />
                                ))
                            ) : (
                                <div className="py-12 text-center text-gray-500">
                                    No sections found. Click "Add New" to begin.
                                </div>
                            )}
                        </div>

                    </SortableContext>
                </DndContext>

                {/* Add New Section */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                        <Plus className="h-4 w-4 mr-1" />
                        Add New Section
                    </button>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    href="/media-library"
                    className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                    <ImageIcon className="h-8 w-8 text-blue-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Media Library</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage all your images and media assets
                    </p>
                </Link>

                <Link
                    href="/landing-page/blog"
                    className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                    <FileText className="h-8 w-8 text-blue-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Blog Posts</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Create and manage blog content
                    </p>
                </Link>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <Sparkles className="h-8 w-8 text-blue-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Check our documentation or contact support
                    </p>
                    <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500">
                        View Guide →
                    </button>
                </div>
            </div>
        </div>
    );
}
