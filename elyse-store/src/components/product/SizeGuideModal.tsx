'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const sizeData = [
    { size: 'XS', bust: '32"', waist: '26"', hip: '35"' },
    { size: 'S', bust: '34"', waist: '28"', hip: '37"' },
    { size: 'M', bust: '36"', waist: '30"', hip: '39"' },
    { size: 'L', bust: '38"', waist: '32"', hip: '41"' },
    { size: 'XL', bust: '40"', waist: '34"', hip: '43"' },
    { size: 'XXL', bust: '42"', waist: '36"', hip: '45"' },
];

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                                <div className="absolute right-0 top-0 pr-4 pt-4">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white text-neutral-400 hover:text-neutral-500"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                                        <Dialog.Title as="h3" className="text-2xl font-serif font-semibold leading-6 text-neutral-900 mb-6">
                                            Size Guide
                                        </Dialog.Title>
                                        <div className="mt-4">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-neutral-200">
                                                    <thead className="bg-neutral-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                                Size
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                                Bust
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                                Waist
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                                Hip
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-neutral-200">
                                                        {sizeData.map((row) => (
                                                            <tr key={row.size}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                                                    {row.size}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                                    {row.bust}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                                    {row.waist}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                                                    {row.hip}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="mt-6 text-sm text-neutral-600">
                                                <p className="font-medium">How to measure:</p>
                                                <ul className="mt-2 space-y-1 list-disc list-inside">
                                                    <li>Bust: Measure around the fullest part of your bust</li>
                                                    <li>Waist: Measure around the narrowest part of your waist</li>
                                                    <li>Hip: Measure around the fullest part of your hips</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
