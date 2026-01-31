"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { X, Loader2, Film, Play } from "lucide-react";

interface VideoUploaderProps {
    onVideoUploaded: (url: string) => void;
    initialVideo?: string;
}

export default function VideoUploader({ onVideoUploaded, initialVideo = "" }: VideoUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string>(initialVideo);

    useEffect(() => {
        if (initialVideo) {
            setVideoUrl(initialVideo);
        }
    }, [initialVideo]);

    const handleFileUpload = async (file: File) => {
        if (file.size > 50 * 1024 * 1024) {
            toast.error("File too large. Max 50MB allowed.");
            return;
        }

        setUploading(true);
        const loadingToast = toast.loading("Uploading video...");

        try {
            const formData = new FormData();
            formData.append("image", file); // API expects 'image' key currently

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Upload failed");
            }

            const data = await res.json();
            const newUrl = data.data.url;

            setVideoUrl(newUrl);
            onVideoUploaded(newUrl);
            toast.success("Video uploaded successfully!", { id: loadingToast });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Upload failed", { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                handleFileUpload(acceptedFiles[0]);
            }
        },
        [onVideoUploaded]
    );

    const { getRootProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        disabled: uploading,
        noClick: true, // IMPORTANT: Disable dropzone's internal click so label works normally
    });

    const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
        // Reset input value so the same file can be selected again if needed
        e.target.value = "";
    };

    const removeVideo = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setVideoUrl("");
        onVideoUploaded("");
    };

    return (
        <div className="space-y-4">
            <label
                {...getRootProps()}
                className={`relative block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive
                    ? "border-black bg-gray-50"
                    : "border-gray-300 hover:border-gray-400"
                    } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {/* 
                  STRATEGY: STANDARD HTML LABEL 
                  Nesting an input inside a label is the most robust way to trigger a file picker.
                  We disable react-dropzone's click handling so it doesn't interfere.
                */}
                <input
                    type="file"
                    onChange={handleNativeChange}
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    className="hidden"
                    disabled={uploading}
                />

                {videoUrl ? (
                    <div className="relative w-full max-w-sm mx-auto">
                        <video
                            src={videoUrl}
                            controls
                            className="max-h-48 mx-auto rounded shadow-sm bg-black"
                            onClick={(e) => e.stopPropagation()} // Prevent picker from opening when clicking video controls
                        />
                        <button
                            type="button"
                            onClick={removeVideo}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 z-10"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-4">
                        {uploading ? (
                            <>
                                <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-3" />
                                <p className="text-sm text-gray-600">Uploading video...</p>
                            </>
                        ) : (
                            <>
                                <Film className="h-10 w-10 text-gray-400 mb-3" />
                                <p className="text-sm text-gray-600 mb-1">
                                    {isDragActive
                                        ? "Drop video here"
                                        : "Click to upload video"}
                                </p>
                                <p className="text-xs text-gray-500 font-mono">
                                    MP4, WebM, MOV (Max 50MB)
                                </p>
                            </>
                        )}
                    </div>
                )}
            </label>
        </div>
    );
}
