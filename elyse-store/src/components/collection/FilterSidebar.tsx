"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import styles from "./FilterSidebar.module.css";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface FilterSidebarProps {
    categories: any[];
    collections: any[];
}

export function FilterSidebar({ categories, collections }: FilterSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state for price inputs to avoid unnecessary refetches while typing
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

    const updateParams = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePriceApply = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (minPrice) params.set("minPrice", minPrice);
        else params.delete("minPrice");

        if (maxPrice) params.set("maxPrice", maxPrice);
        else params.delete("maxPrice");

        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
    const COLORS = [
        { name: "Black", hex: "#000000" },
        { name: "White", hex: "#FFFFFF" },
        { name: "Gold", hex: "#D4AF37" },
        { name: "Maroon", hex: "#800000" },
        { name: "Red", hex: "#FF0000" },
        { name: "Pink", hex: "#FFC0CB" },
        { name: "Blue", hex: "#0000FF" },
        { name: "Green", hex: "#008000" },
    ];

    const currentSize = searchParams.get("size");
    const currentColor = searchParams.get("color");
    const currentAvailability = searchParams.get("inStock");

    return (
        <aside className={styles.sidebar}>
            {/* Availability */}
            <div className={styles.filterSection}>
                <h3 className={styles.sectionTitle}>Availability</h3>
                <div className={styles.optionList}>
                    <label className={styles.optionItem}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={currentAvailability === "true"}
                            onChange={(e) => updateParams("inStock", e.target.checked ? "true" : null)}
                        />
                        <span>In Stock</span>
                    </label>
                    <label className={styles.optionItem}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={currentAvailability === "false"}
                            onChange={(e) => updateParams("inStock", e.target.checked ? "false" : null)}
                        />
                        <span>Out of Stock</span>
                    </label>
                </div>
            </div>

            {/* Price Filter */}
            <div className={styles.filterSection}>
                <h3 className={styles.sectionTitle}>Price</h3>
                <div className={styles.priceInputs}>
                    <div className={styles.priceField}>
                        <span className={styles.currency}>₹</span>
                        <input
                            type="number"
                            className={styles.priceInput}
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                    </div>
                    <span>-</span>
                    <div className={styles.priceField}>
                        <span className={styles.currency}>₹</span>
                        <input
                            type="number"
                            className={styles.priceInput}
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    onClick={handlePriceApply}
                    className="w-full mt-3 py-2 bg-neutral-900 text-white text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                >
                    Apply Price
                </button>
            </div>

            {/* Sizes */}
            <div className={styles.filterSection}>
                <h3 className={styles.sectionTitle}>Size</h3>
                <div className={styles.sizeGrid}>
                    {SIZES.map(size => (
                        <div
                            key={size}
                            onClick={() => updateParams("size", currentSize === size ? null : size)}
                            className={`${styles.sizeBox} ${currentSize === size ? styles.active : ""}`}
                        >
                            {size}
                        </div>
                    ))}
                </div>
            </div>

            {/* Colors */}
            <div className={styles.filterSection}>
                <h3 className={styles.sectionTitle}>Color</h3>
                <div className={styles.swatchList}>
                    {COLORS.map(color => (
                        <div
                            key={color.name}
                            title={color.name}
                            onClick={() => updateParams("color", currentColor === color.name ? null : color.name)}
                            className={`${styles.swatch} ${currentColor === color.name ? styles.active : ""}`}
                            style={{ backgroundColor: color.hex }}
                        />
                    ))}
                </div>
            </div>

            {/* Collections Shortcut */}
            <div className={styles.filterSection}>
                <h3 className={styles.sectionTitle}>Collections</h3>
                <div className={styles.optionList}>
                    <label className={styles.optionItem} onClick={() => router.push('/collections/all')}>
                        <span className={pathname === '/collections/all' ? 'font-bold' : ''}>All Products</span>
                    </label>
                    {collections.slice(0, 5).map(col => (
                        <label
                            key={col.id}
                            className={styles.optionItem}
                            onClick={() => router.push(`/collections/${col.slug}`)}
                        >
                            <span className={pathname === `/collections/${col.slug}` ? 'font-bold' : ''}>{col.name}</span>
                        </label>
                    ))}
                </div>
            </div>
        </aside>
    );
}
