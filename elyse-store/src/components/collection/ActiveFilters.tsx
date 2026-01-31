'use client';

import { XMarkIcon } from '@heroicons/react/20/solid';
import type { ActiveFilter } from '@/types';

interface ActiveFiltersProps {
    filters: ActiveFilter[];
    onRemove: (filterId: string) => void;
    onClearAll: () => void;
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
    if (filters.length === 0) {
        return null;
    }

    return (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-neutral-900">Active Filters</h3>
                <button
                    onClick={onClearAll}
                    className="text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                    Clear All
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <div
                        key={filter.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm animate-fade-in-up"
                    >
                        <span className="text-neutral-500">{filter.category}:</span>
                        <span>{filter.label}</span>
                        <button
                            onClick={() => onRemove(filter.id)}
                            className="ml-1 inline-flex items-center justify-center rounded-full p-0.5 hover:bg-neutral-100 transition-colors"
                        >
                            <XMarkIcon className="h-3.5 w-3.5 text-neutral-500 hover:text-neutral-700" />
                            <span className="sr-only">Remove {filter.label} filter</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
