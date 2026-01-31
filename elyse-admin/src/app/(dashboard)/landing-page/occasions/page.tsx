"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
    Loader2,
    Save,
    Search,
    GripVertical,
    Check
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

interface Category {
    id: string;
    name: string;
    slug: string;
    image_url?: string;
}

interface SelectedCategory extends Category {
    customLabel?: string;
}

// Sortable Item Component
function SortableItem({ category, index, onRemove }: { category: SelectedCategory; index: number; onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id });

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
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg mb-2"
        >
            <div className="flex items-center space-x-3">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-move text-gray-400 hover:text-gray-600 p-1"
                >
                    <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {index + 1}
                </div>
                <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-xs text-gray-500">{category.slug}</p>
                </div>
            </div>
            <button
                onClick={() => onRemove(category.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
                Remove
            </button>
        </div>
    );
}

export default function ShopByStylePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<SelectedCategory[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch all categories
            const categoriesRes = await api.get('/categories');
            if (categoriesRes.data.success) {
                setAllCategories(categoriesRes.data.data);
            }

            // Fetch current settings
            const settingsRes = await api.get('/landing-page-settings');
            if (settingsRes.data.success) {
                const saved = settingsRes.data.data.shop_by_style || [];
                // Hydrate saved categories with current details
                const hydrated = saved.map((s: any) => {
                    const fullCat = categoriesRes.data.data.find((c: Category) => c.id === s.id);
                    return fullCat ? { ...fullCat, customLabel: s.customLabel } : null;
                }).filter(Boolean);
                setSelectedCategories(hydrated);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = selectedCategories.map(c => ({
                id: c.id,
                slug: c.slug,
                name: c.name, // Fallback name
                image_url: c.image_url,
                customLabel: c.customLabel
            }));

            await api.post('/landing-page-settings', {
                key: 'shop_by_style',
                value: payload
            });

            toast.success("Saved successfully!");
        } catch (error) {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const toggleCategory = (category: Category) => {
        const isSelected = selectedCategories.some(c => c.id === category.id);
        if (isSelected) {
            setSelectedCategories(selectedCategories.filter(c => c.id !== category.id));
        } else {
            if (selectedCategories.length >= 10) {
                toast.error("You can select up to 10 categories only.");
                return;
            }
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setSelectedCategories((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const filteredCategories = allCategories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shop by Style / Occasion</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Select and reorder up to 10 categories to display on the homepage.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Available Categories */}
                <div className="bg-white shadow rounded-lg p-6 h-[600px] flex flex-col">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Available Categories</h2>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {filteredCategories.map(cat => {
                            const isSelected = selectedCategories.some(s => s.id === cat.id);
                            return (
                                <div
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat)}
                                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${isSelected
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                >
                                    <span className={`text-sm ${isSelected ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
                                        {cat.name}
                                    </span>
                                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Selected Categories (Sortable) */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 h-[600px] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Selected ({selectedCategories.length}/10)</h2>
                        <span className="text-xs text-gray-500">Drag to reorder</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {selectedCategories.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                                <p>No categories selected</p>
                                <p className="text-sm mt-1">Select from the list on the left</p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={selectedCategories.map(c => c.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {selectedCategories.map((category, index) => (
                                        <SortableItem
                                            key={category.id}
                                            category={category}
                                            index={index}
                                            onRemove={(id) => setSelectedCategories(selectedCategories.filter(c => c.id !== id))}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
