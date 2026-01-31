"use client";

import { useState } from "react";
import { Search, Grid, List, Upload, Trash2, Edit, Check, X, Play, Film } from "lucide-react";

interface MediaAsset {
    id: number;
    filename: string;
    url: string;
    width: number;
    height: number;
    size: number; // in bytes
    mediaType: 'image' | 'video';
    mimeType: string;
    duration?: number; // for videos, in seconds
    thumbnail?: string; // video thumbnail
    uploadedAt: string;
    altText: string;
}

export default function MediaLibraryPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [filterType, setFilterType] = useState<'all' | 'images' | 'videos'>('all');

    // Mock data with videos
    const [mediaAssets] = useState<MediaAsset[]>([
        {
            id: 1,
            filename: "yellow-hero-left.png",
            url: "/heroes/yellow-left.png",
            width: 1920,
            height: 1080,
            size: 245678,
            mediaType: 'image',
            mimeType: "image/png",
            uploadedAt: "2024-11-20",
            altText: "Yellow hero section left image"
        },
        {
            id: 2,
            filename: "yellow-hero-right.png",
            url: "/heroes/yellow-right.png",
            width: 800,
            height: 1200,
            size: 189234,
            mediaType: 'image',
            mimeType: "image/png",
            uploadedAt: "2024-11-20",
            altText: "Yellow hero section right image"
        },
        {
            id: 3,
            filename: "gradient-hero-left.png",
            url: "/heroes/gradient-left.png",
            width: 1920,
            height: 1080,
            size: 312456,
            mediaType: 'image',
            mimeType: "image/png",
            uploadedAt: "2024-11-21",
            altText: "Gradient hero section left image"
        },
        {
            id: 4,
            filename: "mehendi-occasion.png",
            url: "/occasions/mehendi.png",
            width: 600,
            height: 800,
            size: 145789,
            mediaType: 'image',
            mimeType: "image/png",
            uploadedAt: "2024-11-22",
            altText: "Mehendi occasion category"
        },
        {
            id: 5,
            filename: "cocktails-occasion.png",
            url: "/occasions/cocktails.png",
            width: 600,
            height: 800,
            size: 156234,
            mediaType: 'image',
            mimeType: "image/png",
            uploadedAt: "2024-11-22",
            altText: "Cocktails occasion category"
        },
        {
            id: 6,
            filename: "sangeet-occasion.png",
            url: "/occasions/sangeet.png",
            width: 600,
            height: 800,
            size: 178456,
            mediaType: 'image',
            mimeType: "image/png",
            uploadedAt: "2024-11-22",
            altText: "Sangeet occasion category"
        },
        // NEW: Video samples
        {
            id: 7,
            filename: "hero-promo-video.mp4",
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            width: 1920,
            height: 1080,
            size: 15234567,  // 15MB
            mediaType: 'video',
            mimeType: "video/mp4",
            duration: 45,  // 45 seconds
            thumbnail: "/heroes/video-thumb.png",
            uploadedAt: "2024-11-23",
            altText: "Hero promotional video"
        },
        {
            id: 8,
            filename: "brand-story-video.mp4",
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            width: 1280,
            height: 720,
            size: 8456123,  // 8MB
            mediaType: 'video',
            mimeType: "video/mp4",
            duration: 30,
            thumbnail: "/brand/video-thumb.png",
            uploadedAt: "2024-11-24",
            altText: "Brand story video"
        }
    ]);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleSelection = (id: number) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedItems(filteredAssets.map(a => a.id));
    };

    const deselectAll = () => {
        setSelectedItems([]);
    };

    // Filter assets by type
    const filteredAssets = mediaAssets.filter(asset => {
        if (filterType === 'images') return asset.mediaType === 'image';
        if (filterType === 'videos') return asset.mediaType === 'video';
        return true; // 'all'
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Manage all your images and videos
                </p>
            </div>

            {/* Toolbar */}
            <div className="bg-white shadow-sm rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Search */}
                    <div className="flex-1 max-w-md relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search media..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Type Filter - NEW */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Media ({mediaAssets.length})</option>
                            <option value="images">Images ({mediaAssets.filter(a => a.mediaType === 'image').length})</option>
                            <option value="videos">Videos ({mediaAssets.filter(a => a.mediaType === 'video').length})</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="inline-flex rounded-md shadow-sm">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`px-3 py-2 text-sm font-medium rounded-l-md border ${viewMode === "grid"
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                <Grid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${viewMode === "list"
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Upload Button */}
                        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                        </button>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedItems.length > 0 && (
                    <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-md">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-blue-900">
                                {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected
                            </span>
                            <button
                                onClick={deselectAll}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Clear selection
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete ({selectedItems.length})
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Grid View */}
            {viewMode === "grid" && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredAssets.map((asset) => (
                        <div
                            key={asset.id}
                            className={`relative group bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${selectedItems.includes(asset.id)
                                ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                            onClick={() => toggleSelection(asset.id)}
                        >
                            {/* Checkbox */}
                            <div className="absolute top-2 left-2 z-10">
                                <div
                                    className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${selectedItems.includes(asset.id)
                                        ? "bg-blue-600 border-blue-600"
                                        : "bg-white border-gray-300 group-hover:border-gray-400"
                                        }`}
                                >
                                    {selectedItems.includes(asset.id) && (
                                        <Check className="h-3 w-3 text-white" />
                                    )}
                                </div>
                            </div>

                            {/* Type Badge */}
                            {asset.mediaType === 'video' && (
                                <div className="absolute top-2 right-2 z-10">
                                    <div className="bg-black bg-opacity-75 px-2 py-1 rounded flex items-center gap-1">
                                        <Film className="h-3 w-3 text-white" />
                                        <span className="text-xs text-white">Video</span>
                                    </div>
                                </div>
                            )}

                            {/* Image or Video Preview */}
                            <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                                {asset.mediaType === 'video' ? (
                                    <>
                                        <video
                                            src={asset.url}
                                            className="max-w-full max-h-full object-contain"
                                            muted
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                                            <Play className="h-12 w-12 text-white opacity-75" />
                                        </div>
                                        {asset.duration && (
                                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-0.5 rounded text-white text-xs">
                                                {formatDuration(asset.duration)}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <img
                                        src={asset.url}
                                        alt={asset.altText}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3 border-t border-gray-200">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                    {asset.filename}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {asset.width} × {asset.height}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(asset.size)}
                                </p>
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        alert(`Edit ${asset.filename}`);
                                    }}
                                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                                >
                                    <Edit className="h-4 w-4 text-gray-700" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        alert(`Delete ${asset.filename}`);
                                    }}
                                    className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </button>
                            </div>
                        </div>
                    ))}</div>
            )}

            {/* List View */}
            {viewMode === "list" && (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-12 px-6 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === filteredAssets.length}
                                        onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Preview
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Filename
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dimensions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Size
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Uploaded
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAssets.map((asset) => (
                                <tr
                                    key={asset.id}
                                    className={selectedItems.includes(asset.id) ? "bg-blue-50" : "hover:bg-gray-50"}
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(asset.id)}
                                            onChange={() => toggleSelection(asset.id)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden relative">
                                            {asset.mediaType === 'video' ? (
                                                <>
                                                    <video src={asset.url} className="max-w-full max-h-full object-contain" muted />
                                                    <Play className="absolute h-6 w-6 text-white" />
                                                </>
                                            ) : (
                                                <img
                                                    src={asset.url}
                                                    alt={asset.altText}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{asset.filename}</div>
                                        <div className="text-xs text-gray-500">{asset.altText}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${asset.mediaType === 'video' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {asset.mediaType === 'video' && <Film className="h-3 w-3 mr-1" />}
                                            {asset.mediaType.charAt(0).toUpperCase() + asset.mediaType.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {asset.width} × {asset.height}
                                        {asset.duration && <div className="text-xs">({formatDuration(asset.duration)})</div>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatFileSize(asset.size)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {asset.uploadedAt}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                                            Edit
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div className="bg-white shadow-sm rounded-lg px-6 py-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredAssets.length}</span> of{" "}
                        <span className="font-medium">{mediaAssets.length}</span> results
                    </p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>
                            Previous
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                            1
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
