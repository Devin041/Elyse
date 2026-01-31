'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import styles from './Pagination.module.css';

import Link from 'next/link';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
    baseUrl?: string;
    searchParams?: { [key: string]: string | string[] | undefined };
}

/**
 * Pagination component for collection pages
 * Shows page numbers with prev/next navigation
 * Supports both client-side (onPageChange) and server-side (baseUrl) navigation
 */
export function Pagination({ currentPage, totalPages, onPageChange, baseUrl, searchParams }: PaginationProps) {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    const pages = getPageNumbers();

    const getPageLink = (page: number) => {
        if (!baseUrl) return '#';
        const params = new URLSearchParams();
        if (searchParams) {
            Object.entries(searchParams).forEach(([key, value]) => {
                if (key !== 'page' && typeof value === 'string') {
                    params.append(key, value);
                }
            });
        }
        params.set('page', page.toString());
        return `${baseUrl}?${params.toString()}`;
    };

    const renderPageItem = (page: number | string, index: number) => {
        if (page === '...') {
            return <span key={`ellipsis-${index}`} className={styles.ellipsis}>...</span>;
        }

        const p = page as number;
        const isActive = currentPage === p;

        if (baseUrl) {
            return (
                <Link
                    key={p}
                    href={getPageLink(p)}
                    className={`${styles.pageButton} ${isActive ? styles.active : ''}`}
                >
                    {p}
                </Link>
            );
        }

        return (
            <button
                key={p}
                onClick={() => onPageChange?.(p)}
                className={`${styles.pageButton} ${isActive ? styles.active : ''}`}
            >
                {p}
            </button>
        );
    };

    return (
        <div className={styles.pagination}>
            {/* Previous Button */}
            {baseUrl ? (
                currentPage > 1 ? (
                    <Link href={getPageLink(currentPage - 1)} className={styles.navButton} aria-label="Previous page">
                        <ChevronLeftIcon className={styles.icon} />
                    </Link>
                ) : (
                    <button disabled className={styles.navButton}><ChevronLeftIcon className={styles.icon} /></button>
                )
            ) : (
                <button
                    onClick={() => onPageChange?.(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles.navButton}
                    aria-label="Previous page"
                >
                    <ChevronLeftIcon className={styles.icon} />
                </button>
            )}

            {pages.map((page, index) => renderPageItem(page, index))}

            {/* Next Button */}
            {baseUrl ? (
                currentPage < totalPages ? (
                    <Link href={getPageLink(currentPage + 1)} className={styles.navButton} aria-label="Next page">
                        <ChevronRightIcon className={styles.icon} />
                    </Link>
                ) : (
                    <button disabled className={styles.navButton}><ChevronRightIcon className={styles.icon} /></button>
                )
            ) : (
                <button
                    onClick={() => onPageChange?.(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={styles.navButton}
                    aria-label="Next page"
                >
                    <ChevronRightIcon className={styles.icon} />
                </button>
            )}
        </div>
    );
}
