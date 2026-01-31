"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Loader2 } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import ImageUploader from "./ImageUploader";

interface VariantImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    variantId: string;
    variantName: string;
}

interface VariantImage {
    id: string;
    image_url: string;
    is_primary: boolean;
}

export default function VariantImageModal({
    isOpen,
    onClose,
    variantId,
    variantName,
}: VariantImageModalProps) {
    const [images, setImages] = useState<VariantImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && variantId) {
            fetchImages();
        }
    }, [isOpen, variantId]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/products/variants/${variantId}/images`);
            setImages(data.data || []);
        } catch (error) {
            console.error("Failed to fetch variant images", error);
            toast.error("Failed to load images");
        } finally {
            setLoading(false);
        }
    };

    const handleImagesUploaded = async (urls: string[]) => {
        try {
            // The ImageUploader uploads to Cloudinary and gives us URLs.
            // We need to associate these URLs with the variant.
            // Note: ImageUploader calls onImagesUploaded with ALL uploaded images in its session.
            // We only want to send the NEW ones to the backend to create records.
            // However, our backend addVariantImages takes a list of URLs and creates records.
            // A simpler approach for this modal is to let ImageUploader handle the upload to cloud,
            // and then we send the NEW urls to our backend.

            // But wait, ImageUploader maintains its own state of "uploadedImages".
            // If we use it here, we should probably clear it after successful association?
            // Or better: Use a fresh ImageUploader instance or handle the "newly added" logic.

            // Let's simplify: When ImageUploader returns URLs, we send them to backend.
            // But ImageUploader returns ALL urls it has.
            // We'll just send the *latest* batch or modify ImageUploader?
            // Actually, ImageUploader is designed to return the full list. 
            // Let's just take the *last* added ones? No, that's risky.

            // Alternative: We can just send ALL urls and let backend handle duplicates?
            // No, backend inserts new records.

            // Let's look at ImageUploader usage. It returns `newImages` which is the accumulated list.
            // We might need to tweak ImageUploader or just use the `onUpload` event if it had one.
            // Current ImageUploader: `onImagesUploaded(newImages)` where newImages is the full list.

            // Workaround: We will pass a handler that calculates the difference or just accepts the *newly uploaded* ones.
            // Actually, looking at ImageUploader code:
            // It calls `onImagesUploaded(newImages)` where `newImages` is `[...uploadedImages, ...data.data.urls]`.

            // We will modify this component to just take the *new* URLs and send them to backend immediately.
            // Since ImageUploader keeps state, we might want to mount a fresh one or ignore its internal state?
            // Let's just assume for this modal, we upload, get the URL, save to DB, and refresh the list.
            // We can pass `key={Date.now()}` to reset ImageUploader after successful upload?

            // Let's try sending the *difference*?
            // Or better: We send the URLs to backend.

            // Let's just send the URLs.
            await api.post(`/products/variants/${variantId}/images`, {
                images: urls
            });

            toast.success("Images saved to variant");
            fetchImages(); // Refresh the list

        } catch (error) {
            toast.error("Failed to save images");
        }
    };

    const handleDelete = async (imageId: string) => {
        if (!confirm("Delete this image?")) return;

        setDeletingId(imageId);
        try {
            await api.delete(`/products/variants/images/${imageId}`);
            setImages(images.filter(img => img.id !== imageId));
            toast.success("Image deleted");
        } catch (error) {
            toast.error("Failed to delete image");
        } finally {
            setDeletingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h3 className="text-lg font-medium text-gray-900">
                        Images for {variantName}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Existing Images */}
                    <div className="mb-8">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Current Images
                        </h4>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                            </div>
                        ) : images.length > 0 ? (
                            <div className="grid grid-cols-3 gap-4">
                                {images.map((img) => (
                                    <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                        <img
                                            src={img.image_url}
                                            alt="Variant"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => handleDelete(img.id)}
                                            disabled={deletingId === img.id}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                                        >
                                            {deletingId === img.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">
                                No images for this variant yet.
                            </p>
                        )}
                    </div>

                    {/* Upload New */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Upload New Images
                        </h4>
                        {/* We force remount ImageUploader when variantId changes to clear its state */}
                        <ImageUploader
                            key={variantId + images.length}
                            onImagesUploaded={handleImagesUploaded}
                            maxImages={5}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
