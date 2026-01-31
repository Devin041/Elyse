"use client";

import { useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import type { SalesDataPoint } from "@/types/dashboard";

interface SalesChartProps {
    data: SalesDataPoint[];
    loading?: boolean;
}

const timeRanges = [
    { label: "7 Days", value: 7 },
    { label: "30 Days", value: 30 },
    { label: "90 Days", value: 90 },
];

export default function SalesChart({ data, loading = false }: SalesChartProps) {
    const [selectedRange, setSelectedRange] = useState(7);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-80 bg-gray-100 rounded"></div>
            </div>
        );
    }

    // Format data for chart
    const chartData = data.map((item) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
        }),
    }));

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
                    Sales Overview
                </h2>

                {/* Time Range Selector */}
                <div className="flex items-center gap-2">
                    {timeRanges.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => setSelectedRange(range.value)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${selectedRange === range.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        tickLine={false}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                            padding: "0.75rem",
                        }}
                        formatter={(value: number, name: string) => [
                            name === "revenue"
                                ? `₹${value.toLocaleString()}`
                                : value.toString(),
                            name === "revenue" ? "Revenue" : "Orders",
                        ]}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: "1rem" }}
                        formatter={(value) =>
                            value === "revenue" ? "Revenue (₹)" : "Orders (#)"
                        }
                    />
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                        name="revenue"
                    />
                    <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#ordersGradient)"
                        name="orders"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
