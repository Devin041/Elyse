'use client';

import React from 'react';
import { clsx } from 'clsx';
import { CheckIcon } from '@heroicons/react/24/outline';

const stages = [
    { id: 'pending', label: 'Pending', color: 'bg-neutral-200' },
    { id: 'processing', label: 'Processing', color: 'bg-yellow-200' },
    { id: 'shipped', label: 'Shipped', color: 'bg-purple-200' },
    { id: 'delivered', label: 'Delivered', color: 'bg-green-200' },
];

interface OrderTrackingStepsProps {
    status: string;
}

export function OrderTrackingSteps({ status }: OrderTrackingStepsProps) {
    const statusLower = status?.toLowerCase() || 'pending';

    // Handle cancelled state - you might want a special view, but for now just show at current progress
    // or keep it at start.
    if (statusLower === 'cancelled') {
        return (
            <div className="w-full py-4 text-center">
                <span className="text-red-500 font-bold uppercase tracking-widest text-xs">Order Cancelled</span>
            </div>
        );
    }

    // Find index of current status
    let activeIndex = stages.findIndex(s => s.id === statusLower);
    if (activeIndex === -1) activeIndex = 0; // Default to first step

    return (
        <div className="w-full py-6">
            <div className="relative flex justify-between items-center w-full">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-neutral-100 -translate-y-1/2 z-0" />
                <div
                    className="absolute top-1/2 left-0 h-[2px] bg-neutral-900 -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out"
                    style={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
                />

                {/* Steps */}
                {stages.map((stage, index) => {
                    const isCompleted = index < activeIndex;
                    const isActive = index === activeIndex;

                    return (
                        <div key={stage.id} className="relative z-10 flex flex-col items-center">
                            <div
                                className={clsx(
                                    "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                    isCompleted ? "bg-neutral-900 border-neutral-900 text-white" :
                                        isActive ? "bg-white border-neutral-900 text-neutral-900 scale-110 shadow-lg" :
                                            "bg-white border-neutral-100 text-neutral-300"
                                )}
                            >
                                {isCompleted ? (
                                    <CheckIcon className="h-4 w-4 stroke-[3px]" />
                                ) : (
                                    <span className="text-[10px] font-bold">{index + 1}</span>
                                )}
                            </div>
                            <span
                                className={clsx(
                                    "absolute top-10 text-[10px] uppercase tracking-tighter sm:tracking-widest font-bold whitespace-nowrap transition-colors duration-500",
                                    isActive ? "text-neutral-900" : "text-neutral-400"
                                )}
                            >
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
