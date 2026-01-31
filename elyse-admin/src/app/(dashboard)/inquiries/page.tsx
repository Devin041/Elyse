"use client";

import { useState, useEffect } from "react";
import { Mail, RefreshCw, Trash2, CheckCircle, Clock, Archive, X } from "lucide-react";
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Inquiry {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'archived';
    created_at: string;
}

export default function InquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchInquiries = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/inquiries');
            if (!res.ok) throw new Error('Failed to fetch inquiries');
            const data = await res.json();
            setInquiries(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load inquiries");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const handleView = async (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        setIsModalOpen(true);

        // Mark as read if it's new
        if (inquiry.status === 'new') {
            try {
                await fetch(`/api/inquiries/${inquiry.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'read' })
                });
                // Update local state
                setInquiries(prev => prev.map(i =>
                    i.id === inquiry.id ? { ...i, status: 'read' } : i
                ));
            } catch (error) {
                console.error('Failed to update status:', error);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this inquiry?')) return;

        try {
            const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Inquiry deleted');
            setInquiries(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            toast.error('Failed to delete inquiry');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'new': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'read': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'archived': return <Archive className="h-4 w-4 text-gray-500" />;
            default: return null;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'new': return "bg-blue-50 text-blue-700 border-blue-100";
            case 'read': return "bg-green-50 text-green-700 border-green-100";
            case 'archived': return "bg-gray-50 text-gray-700 border-gray-100";
            default: return "";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customer Inquiries</h1>
                    <p className="text-gray-500">Manage messages from the Contact Us page</p>
                </div>
                <button
                    onClick={fetchInquiries}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    <RefreshCw className={isLoading ? "animate-spin mr-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                    Refresh
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : inquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No inquiries found
                                    </td>
                                </tr>
                            ) : (
                                inquiries.map((inquiry) => (
                                    <tr key={inquiry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(inquiry.created_at), 'MMM dd, p')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                                            <div className="text-sm text-gray-500">{inquiry.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-medium">{inquiry.subject}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{inquiry.message}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(inquiry.status)}`}>
                                                {getStatusIcon(inquiry.status)}
                                                <span className="ml-1 uppercase">{inquiry.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleView(inquiry)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDelete(inquiry.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inquiry Detail Modal */}
            {isModalOpen && selectedInquiry && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/50 transition-opacity"
                            onClick={() => setIsModalOpen(false)}
                        />

                        {/* Modal */}
                        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 z-10">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Inquiry Details</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">From</label>
                                        <p className="text-gray-900 font-medium">{selectedInquiry.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                                        <p className="text-gray-900">{selectedInquiry.email}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Subject</label>
                                    <p className="text-gray-900 font-medium">{selectedInquiry.subject}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Date</label>
                                    <p className="text-gray-900">
                                        {format(new Date(selectedInquiry.created_at), 'MMMM dd, yyyy \'at\' p')}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Message</label>
                                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 flex justify-end gap-3">
                                <a
                                    href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Reply via Email
                                </a>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
