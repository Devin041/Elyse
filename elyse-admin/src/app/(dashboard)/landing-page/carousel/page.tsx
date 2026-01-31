"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye, Plus, Edit2, Trash2, GripVertical, X } from "lucide-react";
import Link from "next/link";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productCarouselSchema } from '@/lib/validations/landingPage';
import { toast } from 'react-hot-toast';
import type { z } from 'zod';
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

type ProductCarouselFormData = z.infer<typeof productCarouselSchema>;

interface CarouselTab {
    id: string;
    name: string;
    color: string;
    productIds: number[];
}

interface Product {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
}

function SortableTab({ tab, onEdit, onDelete }: {
    tab: CarouselTab;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: tab.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : 0,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="cursor-move text-gray-400 hover:text-gray-600 touch-none"
                type="button"
            >
                <GripVertical className="h-5 w-5" />
            </button>

            {/* Color Indicator */}
            <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: tab.color }}
            />

            {/* Tab Info */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{tab.name}</h3>
                    <span className="text-xs text-gray-500">
                        ({tab.productIds.length} {tab.productIds.length === 1 ? 'product' : 'products'})
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onEdit}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    type="button"
                >
                    <Edit2 className="h-4 w-4" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    type="button"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export default function ProductCarouselPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
        getValues,
        reset
    } = useForm<ProductCarouselFormData>({
        resolver: zodResolver(productCarouselSchema),
        defaultValues: {
            sectionTitle: "",
            tabs: [],
            autoplayInterval: 5,
            showArrows: true,
            showDots: true,
            isEnabled: true
        },
    });

    const { fields, append, remove, move, update, replace } = useFieldArray({
        control,
        name: "tabs"
    });

    const [isTabModalOpen, setIsTabModalOpen] = useState(false);
    const [editingTabIndex, setEditingTabIndex] = useState<number | null>(null);
    const [tempTab, setTempTab] = useState<CarouselTab | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [carouselRes, productsRes] = await Promise.all([
                    fetch('/api/landing-page/carousel'),
                    fetch('/api/products')
                ]);

                if (!carouselRes.ok) throw new Error('Failed to fetch carousel');
                const carouselData = await carouselRes.json();

                if (productsRes.ok) {
                    const productsData = await productsRes.json();
                    setAvailableProducts(productsData.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        imageUrl: p.primary_image || '/placeholder.png'
                    })));
                }

                if (carouselData) {
                    reset({
                        sectionTitle: carouselData.title,
                        isEnabled: carouselData.is_enabled,
                        autoplayInterval: carouselData.config?.autoplayInterval || 5,
                        showArrows: carouselData.config?.showArrows ?? true,
                        showDots: carouselData.config?.showDots ?? true,
                        tabs: carouselData.carousel_tabs?.sort((a: any, b: any) => a.display_order - b.display_order).map((t: any) => ({
                            id: t.id,
                            name: t.tab_name,
                            color: t.color || '#000000',
                            productIds: t.product_ids || []
                        })) || []
                    });
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load carousel data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [reset]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = fields.findIndex((t) => t.id === active.id);
            const newIndex = fields.findIndex((t) => t.id === over.id);
            move(oldIndex, newIndex);
        }
    };

    const onSubmit = async (data: ProductCarouselFormData) => {
        try {
            const payload = {
                title: data.sectionTitle,
                is_enabled: data.isEnabled,
                config: {
                    autoplayInterval: data.autoplayInterval,
                    showArrows: data.showArrows,
                    showDots: data.showDots
                },
                tabs: data.tabs.map((tab, index) => ({
                    id: tab.id.startsWith('temp-') ? null : tab.id,
                    tab_name: tab.name,
                    color: tab.color,
                    product_ids: tab.productIds,
                    display_order: index + 1
                }))
            };

            const res = await fetch('/api/landing-page/carousel', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to update carousel');

            toast.success("Product Carousel saved successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save changes. Please try again.");
        }
    };

    const openTabModal = (index?: number) => {
        if (index !== undefined) {
            setEditingTabIndex(index);
            setTempTab(fields[index]);
        } else {
            setEditingTabIndex(null);
            setTempTab({
                id: `temp-${Date.now()}`,
                name: 'New Tab',
                color: '#6B7280',
                productIds: []
            });
        }
        setIsTabModalOpen(true);
    };

    const closeTabModal = () => {
        setIsTabModalOpen(false);
        setEditingTabIndex(null);
        setTempTab(null);
    };

    const saveTab = () => {
        if (tempTab) {
            if (editingTabIndex !== null) {
                update(editingTabIndex, tempTab);
            } else {
                append(tempTab);
            }
            closeTabModal();
        }
    };

    const toggleProductSelection = (productId: number) => {
        if (tempTab) {
            // @ts-ignore - productIds might be strings if coming from API
            const isSelected = tempTab.productIds.includes(productId as any);
            const newProductIds = isSelected
                // @ts-ignore
                ? tempTab.productIds.filter(id => id !== (productId as any))
                // @ts-ignore
                : [...tempTab.productIds, productId as any];
            setTempTab({ ...tempTab, productIds: newProductIds });
        }
    };

    // Watch values for preview
    const watchedTabs = watch("tabs");
    const watchedSectionTitle = watch("sectionTitle");

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
                            Product Carousel
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Showcase products in a tabbed carousel
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
                    {/* Basic Settings */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Settings</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("sectionTitle")}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.sectionTitle ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., Shop by Collection"
                                />
                                {errors.sectionTitle && (
                                    <p className="text-red-500 text-sm mt-1">{errors.sectionTitle.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs Management */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Tabs</h2>
                            <button
                                type="button"
                                onClick={() => openTabModal()}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Tab
                            </button>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={fields.map(t => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    {fields.map((tab, index) => (
                                        <SortableTab
                                            key={tab.id}
                                            tab={tab}
                                            onEdit={() => openTabModal(index)}
                                            onDelete={() => remove(index)}
                                        />
                                    ))}

                                    {fields.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <p className="text-sm">No tabs yet. Click "Add Tab" to get started.</p>
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </DndContext>
                        {errors.tabs && (
                            <p className="text-red-500 text-sm mt-2">{errors.tabs.message}</p>
                        )}
                    </div>

                    {/* Carousel Settings */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Carousel Settings</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Autoplay Interval (seconds)
                                </label>
                                <input
                                    type="number"
                                    {...register("autoplayInterval", { valueAsNumber: true })}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0 for no autoplay"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Set to 0 to disable autoplay
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        {...register("showArrows")}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Show navigation arrows</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        {...register("showDots")}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Show dot indicators</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>

                        <div className="border border-gray-200 rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                                {watchedSectionTitle || "Section Title"}
                            </h2>

                            {/* Tabs */}
                            <div className="flex justify-center gap-2 mb-6 flex-wrap">
                                {watchedTabs?.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        className="px-4 py-2 rounded-full text-white text-sm font-medium"
                                        style={{ backgroundColor: tab.color }}
                                    >
                                        {tab.name}
                                    </button>
                                ))}
                            </div>

                            {/* Product Grid Preview */}
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="border border-gray-200 rounded-lg p-3">
                                        <div className="aspect-square bg-gray-100 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                    </div>
                                ))}
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
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">Tips</h3>
                        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                            <li>Drag tabs to reorder them</li>
                            <li>Each tab can show different products</li>
                            <li>Use distinct colors for each tab</li>
                            <li>Aim for 3-6 products per tab</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Tab Editor Modal */}
            {isTabModalOpen && tempTab && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingTabIndex !== null ? 'Edit Tab' : 'New Tab'}
                            </h3>
                            <button
                                type="button"
                                onClick={closeTabModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Tab Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tab Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={tempTab.name}
                                    onChange={(e) => setTempTab({ ...tempTab, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Mehendi, Cocktails"
                                />
                            </div>

                            {/* Tab Color */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tab Color
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={tempTab.color}
                                        onChange={(e) => setTempTab({ ...tempTab, color: e.target.value })}
                                        className="h-10 w-16 rounded border border-gray-300"
                                    />
                                    <input
                                        type="text"
                                        value={tempTab.color}
                                        onChange={(e) => setTempTab({ ...tempTab, color: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            {/* Product Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Products ({tempTab.productIds.length} selected)
                                </label>
                                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                    {availableProducts.map((product) => (
                                        <label
                                            key={product.id}
                                            className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={tempTab.productIds.includes(product.id as any)}
                                                onChange={() => toggleProductSelection(product.id)}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-xs text-gray-500">₹{product.price.toLocaleString()}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={closeTabModal}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={saveTab}
                                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Save Tab
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
