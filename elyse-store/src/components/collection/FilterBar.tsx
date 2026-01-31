'use client';

import { useState } from 'react';
import { FunnelIcon, Bars3Icon, Squares2X2Icon, ViewColumnsIcon } from '@heroicons/react/24/outline';
import styles from './FilterBar.module.css';

interface FilterBarProps {
    onSortChange: (sort: string) => void;
    onViewChange: (view: number) => void;
    currentView: number;
    showFilters?: boolean;
    onToggleFilters?: () => void;
}

/**
 * Filter and sort controls for collection pages
 * Includes filter dropdown, sort dropdown, and view toggle
 */
export function FilterBar({
    onSortChange,
    onViewChange,
    currentView,
    currentSort = 'newest',
    productCount,
    showFilters = true,
    onToggleFilters
}: FilterBarProps & { currentSort?: string, productCount?: number }) {
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onSortChange(value);
    };

    return (
        <div className={styles.filterBar}>
            <div className={styles.leftControls}>
                {/* Filter Dropdown */}
                <button
                    className={styles.filterButton}
                    onClick={onToggleFilters}
                >
                    <FunnelIcon className={styles.icon} />
                    <span>{showFilters ? 'HIDE FILTERS' : 'SHOW FILTERS'}</span>
                </button>

                {/* Sort Dropdown */}
                <div className={styles.sortWrapper}>
                    <select
                        value={currentSort}
                        onChange={handleSortChange}
                        className={styles.sortSelect}
                    >
                        <option value="date-new">DATE: NEW TO OLD</option>
                        <option value="date-old">DATE: OLD TO NEW</option>
                        <option value="price-low">PRICE: LOW TO HIGH</option>
                        <option value="price-high">PRICE: HIGH TO LOW</option>
                        <option value="name-az">NAME: A TO Z</option>
                        <option value="name-za">NAME: Z TO A</option>
                    </select>
                </div>
            </div>

            {/* View Toggle */}
            <div className={styles.viewToggle}>
                <button
                    onClick={() => onViewChange(2)}
                    className={`${styles.viewButton} ${currentView === 2 ? styles.active : ''}`}
                    aria-label="2 column view"
                >
                    <ViewColumnsIcon className={styles.viewIcon} />
                </button>
                <button
                    onClick={() => onViewChange(3)}
                    className={`${styles.viewButton} ${currentView === 3 ? styles.active : ''}`}
                    aria-label="3 column view"
                >
                    <Bars3Icon className={styles.viewIcon} />
                </button>
                <button
                    onClick={() => onViewChange(4)}
                    className={`${styles.viewButton} ${currentView === 4 ? styles.active : ''}`}
                    aria-label="4 column view"
                >
                    <Squares2X2Icon className={styles.viewIcon} />
                </button>
            </div>
        </div>
    );
}
