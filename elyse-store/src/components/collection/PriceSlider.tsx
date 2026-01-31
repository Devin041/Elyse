'use client';

import { useState, useEffect } from 'react';
import type { PriceRange } from '@/types';

interface PriceSliderProps {
    min: number;
    max: number;
    value: PriceRange;
    onChange: (range: PriceRange) => void;
}

export function PriceSlider({ min, max, value, onChange }: PriceSliderProps) {
    const [localValue, setLocalValue] = useState<PriceRange>(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = Number(e.target.value);
        const newValue = { min: newMin, max: Math.max(newMin, localValue.max) };
        setLocalValue(newValue);
        onChange(newValue);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Number(e.target.value);
        const newValue = { min: Math.min(localValue.min, newMax), max: newMax };
        setLocalValue(newValue);
        onChange(newValue);
    };

    return (
        <div className="space-y-4">
            {/* Price Display */}
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-900">
                    ₹{localValue.min.toLocaleString()}
                </span>
                <span className="text-neutral-500">-</span>
                <span className="font-medium text-neutral-900">
                    ₹{localValue.max.toLocaleString()}
                </span>
            </div>

            {/* Dual Range Slider */}
            <div className="relative px-2">
                {/* Track */}
                <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-neutral-200 rounded-full -translate-y-1/2" />

                {/* Active Range */}
                <div
                    className="absolute top-1/2 h-1.5 bg-neutral-900 rounded-full -translate-y-1/2"
                    style={{
                        left: `${((localValue.min - min) / (max - min)) * 100}%`,
                        right: `${100 - ((localValue.max - min) / (max - min)) * 100}%`,
                    }}
                />

                {/* Min Slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={500}
                    value={localValue.min}
                    onChange={handleMinChange}
                    className="absolute w-full h-1.5 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-neutral-900 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                />

                {/* Max Slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={500}
                    value={localValue.max}
                    onChange={handleMaxChange}
                    className="absolute w-full h-1.5 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-neutral-900 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                />
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="min-price" className="block text-xs text-neutral-500 mb-1">
                        Min
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">₹</span>
                        <input
                            id="min-price"
                            type="number"
                            min={min}
                            max={max}
                            value={localValue.min}
                            onChange={handleMinChange}
                            className="w-full pl-7 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="max-price" className="block text-xs text-neutral-500 mb-1">
                        Max
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">₹</span>
                        <input
                            id="max-price"
                            type="number"
                            min={min}
                            max={max}
                            value={localValue.max}
                            onChange={handleMaxChange}
                            className="w-full pl-7 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
