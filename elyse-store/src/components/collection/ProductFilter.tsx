'use client';

import { Fragment } from 'react';
import { Dialog, Disclosure, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid';
import { PriceSlider } from './PriceSlider';
import type { FilterGroup, PriceRange, ActiveFilter } from '@/types';

interface ProductFilterProps {
    filters: FilterGroup[];
    mobileFiltersOpen: boolean;
    setMobileFiltersOpen: (open: boolean) => void;
    priceRange: PriceRange;
    onPriceChange: (range: PriceRange) => void;
    activeFilters: ActiveFilter[];
    onFilterChange: (filterId: string, value: string, label: string, category: string, checked: boolean) => void;
}

export function ProductFilter({
    filters,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    priceRange,
    onPriceChange,
    activeFilters,
    onFilterChange
}: ProductFilterProps) {
    const renderFilterSection = (section: FilterGroup, isMobile: boolean = false) => {
        const prefix = isMobile ? 'mobile-' : '';

        if (section.type === 'range') {
            return (
                <Disclosure as="div" key={section.id} className={isMobile ? "border-t border-neutral-200 px-4 py-6" : "border-b border-neutral-200 py-6"} defaultOpen>
                    {({ open }) => (
                        <>
                            <h3 className={isMobile ? "-mx-2 -my-3 flow-root" : "-my-3 flow-root"}>
                                <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-neutral-400 hover:text-neutral-500">
                                    <span className="font-medium text-neutral-900">{section.label}</span>
                                    <span className="ml-6 flex items-center">
                                        {open ? (
                                            <MinusIcon className="h-5 w-5" aria-hidden="true" />
                                        ) : (
                                            <PlusIcon className="h-5 w-5" aria-hidden="true" />
                                        )}
                                    </span>
                                </Disclosure.Button>
                            </h3>
                            <Disclosure.Panel className="pt-6">
                                <PriceSlider
                                    min={section.min || 0}
                                    max={section.max || 50000}
                                    value={priceRange}
                                    onChange={onPriceChange}
                                />
                            </Disclosure.Panel>
                        </>
                    )}
                </Disclosure>
            );
        }

        return (
            <Disclosure as="div" key={section.id} className={isMobile ? "border-t border-neutral-200 px-4 py-6" : "border-b border-neutral-200 py-6"} defaultOpen>
                {({ open }) => (
                    <>
                        <h3 className={isMobile ? "-mx-2 -my-3 flow-root" : "-my-3 flow-root"}>
                            <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-neutral-400 hover:text-neutral-500">
                                <span className="font-medium text-neutral-900">{section.label}</span>
                                <span className="ml-6 flex items-center">
                                    {open ? (
                                        <MinusIcon className="h-5 w-5" aria-hidden="true" />
                                    ) : (
                                        <PlusIcon className="h-5 w-5" aria-hidden="true" />
                                    )}
                                </span>
                            </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel className="pt-6">
                            <div className={isMobile ? "space-y-6" : "space-y-4"}>
                                {section.options.map((option, optionIdx) => {
                                    const isChecked = activeFilters.some(
                                        (f) => f.filterId === section.id && f.value === option.value
                                    );

                                    return (
                                        <div key={option.value} className="flex items-center">
                                            <input
                                                id={`filter-${prefix}${section.id}-${optionIdx}`}
                                                name={`${section.id}[]`}
                                                value={option.value}
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => onFilterChange(
                                                    section.id,
                                                    option.value,
                                                    option.label,
                                                    section.label,
                                                    e.target.checked
                                                )}
                                                className="h-4 w-4 rounded border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                                            />
                                            <label
                                                htmlFor={`filter-${prefix}${section.id}-${optionIdx}`}
                                                className={isMobile ? "ml-3 min-w-0 flex-1 text-neutral-500" : "ml-3 text-sm text-neutral-600"}
                                            >
                                                {option.label}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
        );
    };

    return (
        <>
            {/* Mobile filter dialog */}
            <Transition.Root show={mobileFiltersOpen} as={Fragment}>
                <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-in-out duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-40 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white shadow-2xl">
                                <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-200">
                                    <h2 className="text-lg font-medium text-neutral-900">Filters</h2>
                                    <button
                                        type="button"
                                        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-neutral-400 hover:text-neutral-600"
                                        onClick={() => setMobileFiltersOpen(false)}
                                    >
                                        <span className="sr-only">Close menu</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Filters */}
                                <form className="flex-1 overflow-y-auto">
                                    {filters.map((section) => renderFilterSection(section, true))}
                                </form>

                                {/* Apply Button */}
                                <div className="border-t border-neutral-200 px-4 py-4">
                                    <button
                                        type="button"
                                        onClick={() => setMobileFiltersOpen(false)}
                                        className="w-full rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Desktop filters */}
            <form className="hidden lg:block">
                {filters.map((section) => renderFilterSection(section, false))}
            </form>
        </>
    );
}
