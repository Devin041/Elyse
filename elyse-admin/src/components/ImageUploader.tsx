"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Upload, X, Loader2 } from "lucide-react";
import ImageCropper from "./ImageCropper";

interface ImageUploaderProps {
    onImagesUploaded: (urls: string[]) => void;
    onBusyChange?: (isBusy: boolean) => void;
    maxImages?: number;
    initialImages?: string[];
    aspectRatio?: number; // default 3/4 for products, use 16/9 for banners
    cropTitle?: string; // default "Crop Product Photo"
}

export default function ImageUploader({
    onImagesUploaded,
    onBusyChange,
    maxImages = 5,
    initialImages = [],
    aspectRatio = 3 / 4,
    cropTitle = "Crop Product Photo"
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>(initialImages);

    // Cropping State
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [currentCroppingImage, setCurrentCroppingImage] = useState<string | null>(null);

    // Proxy isBusy state to parent
    useEffect(() => {
        if (onBusyChange) {
            onBusyChange(uploading || pendingFiles.length > 0);
        }
    }, [uploading, pendingFiles.length, onBusyChange]);

    useEffect(() => {
        if (initialImages.length > 0 && uploadedImages.length === 0) {
            setUploadedImages(initialImages);
        }
    }, [initialImages, uploadedImages.length]);

    // Handle the actual upload to server
    const uploadSingleFile = async (fileBlob: Blob | File) => {
        const formData = new FormData();
        const file = fileBlob instanceof File ? fileBlob : new File([fileBlob], `product-${Date.now()}.jpg`, { type: "image/jpeg" });
        formData.append("image", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.data.url;
    };

    const handleFileUploads = (files: File[]) => {
        setUploadedImages(prev => {
            const remaining = maxImages - prev.length;
            const filesToProcess = files.slice(0, remaining);
            if (filesToProcess.length > 0) {
                setPendingFiles(filesToProcess);
                processNextInQueue(filesToProcess);
            }
            return prev;
        });
    };

    const processNextInQueue = (queue: File[]) => {
        if (queue.length === 0) {
            setCurrentCroppingImage(null);
            return;
        }

        const file = queue[0];
        const reader = new FileReader();
        reader.onload = () => {
            setCurrentCroppingImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const onCropComplete = async (croppedBlob: Blob) => {
        setUploading(true);
        const loadingToast = toast.loading("Processing and uploading image...");

        try {
            const url = await uploadSingleFile(croppedBlob);

            // USE FUNCTIONAL UPDATE to avoid stale closures
            setUploadedImages(prev => {
                const next = [...prev, url];
                onImagesUploaded(next);
                return next;
            });

            toast.success("Image added successfully!", { id: loadingToast });

            // Move to next in queue
            setPendingFiles(prev => {
                const nextQueue = prev.slice(1);
                processNextInQueue(nextQueue);
                return nextQueue;
            });
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image", { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    const onCropCancel = () => {
        // Skip current and move to next or stop
        setPendingFiles(prev => {
            const nextQueue = prev.slice(1);
            processNextInQueue(nextQueue);
            return nextQueue;
        });
    };

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            handleFileUploads(acceptedFiles);
        },
        [uploadedImages, maxImages, onImagesUploaded, pendingFiles]
    );

    const { getRootProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: maxImages - uploadedImages.length,
        disabled: uploading || uploadedImages.length >= maxImages || pendingFiles.length > 0,
        noClick: true,
    });

    const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            handleFileUploads(files);
        }
        e.target.value = "";
    };

    const removeImage = (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        const newImages = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(newImages);
        onImagesUploaded(newImages);
    };

    return (
        <div className="space-y-4">
            {/* Cropper Modal */}
            {currentCroppingImage && (
                <ImageCropper
                    image={currentCroppingImage}
                    onCropComplete={onCropComplete}
                    onCancel={onCropCancel}
                    aspectRatio={aspectRatio}
                    cropTitle={cropTitle}
                />
            )}

            {uploadedImages.length < maxImages && (
                <label
                    {...getRootProps()}
                    className={`relative block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                        ? "border-black bg-gray-50"
                        : "border-gray-300 hover:border-gray-400"
                        } ${uploading || pendingFiles.length > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    <input
                        type="file"
                        multiple={maxImages > 1}
                        onChange={handleNativeChange}
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={uploading || uploadedImages.length >= maxImages || pendingFiles.length > 0}
                    />

                    <div className="flex flex-col items-center">
                        {uploading ? (
                            <>
                                <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-3" />
                                <p className="text-sm text-gray-600">Uploading...</p>
                            </>
                        ) : pendingFiles.length > 0 ? (
                            <>
                                <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-3" />
                                <p className="text-sm text-gray-600">Waiting for crop...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="h-10 w-10 text-gray-400 mb-3" />
                                <p className="text-sm text-gray-600 mb-1">
                                    {isDragActive
                                        ? "Drop images here"
                                        : "Drag & drop images, or click to select"}
                                </p>
                                <p className="text-xs text-gray-500 font-mono">
                                    PNG, JPG, WEBP - {aspectRatio >= 1 ? 'Landscape' : 'Portrait'} Crop
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Recommended: {aspectRatio > 2 ? "1920 x 600 px" : "1200 x 1600 px"}
                                </p>
                            </>
                        )}
                    </div>
                </label>
            )
            }

            {
                uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {uploadedImages.map((url, index) => (
                            <div key={url + index} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50" style={{ aspectRatio: aspectRatio }}>
                                <img
                                    src={url}
                                    alt={`Uploaded ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => removeImage(e, index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )
            }
        </div >
    );
}

