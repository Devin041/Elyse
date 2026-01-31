"use client";

import { X } from "lucide-react";
import VariantMatrix from "./VariantMatrix";

interface BulkVariantModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productSlug: string;
    productImages?: string[];
    onSuccess: () => void;
}

export default function BulkVariantModal({
    isOpen,
    onClose,
    productId,
    productSlug,
    productImages = [],
    onSuccess,
}: BulkVariantModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-center px-8 py-5 border-b bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            Bulk Variant Matrix
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">Generate multiple sizes and colors instantly</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1 bg-white">
                    <VariantMatrix
                        productId={productId}
                        productSlug={productSlug}
                        productImages={productImages}
                        onSuccess={() => {
                            onSuccess();
                            onClose();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
