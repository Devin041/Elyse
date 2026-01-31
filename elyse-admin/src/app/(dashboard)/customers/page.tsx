"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, Loader2, Mail, Phone, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface Customer {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    created_at: string;
    total_orders?: number;
    total_spent?: number;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            // Fetch all users with customer role
            const { data } = await api.get("/auth/users?role=customer");
            setCustomers(data.data || []);
        } catch (error) {
            // Fallback: Try getting from orders
            try {
                const { data } = await api.get("/orders?limit=100");
                const orders = data.data;

                // Extract unique customers from orders
                const customerMap = new Map();
                orders.forEach((order: any) => {
                    if (!customerMap.has(order.user_email)) {
                        customerMap.set(order.user_email, {
                            id: order.user_id || order.id,
                            email: order.user_email,
                            first_name: order.user_email.split("@")[0],
                            last_name: "",
                            phone: "",
                            created_at: order.created_at,
                            total_orders: 1,
                            total_spent: Number(order.total_amount),
                        });
                    } else {
                        const customer = customerMap.get(order.user_email);
                        customer.total_orders += 1;
                        customer.total_spent += Number(order.total_amount);
                    }
                });

                setCustomers(Array.from(customerMap.values()));
            } catch (err) {
                toast.error("Failed to fetch customers");
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(
        (c) =>
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {customers.length} total customers
                    </p>
                </div>
                <div className="flex items-center">
                    <Users className="h-6 w-6 text-gray-400 mr-2" />
                    <span className="text-lg font-medium text-gray-900">
                        {customers.length}
                    </span>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by email or name..."
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Customers Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Orders
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Spent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <p className="text-gray-500">No customers found</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Customers will appear here once they place orders
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-600 font-medium">
                                                        {customer.first_name?.charAt(0) || customer.email.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {customer.first_name} {customer.last_name}
                                                </div>
                                                <div className="text-sm text-gray-500">{customer.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col space-y-1">
                                            {customer.email && (
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Mail className="h-3 w-3 mr-1 text-gray-400" />
                                                    {customer.email}
                                                </div>
                                            )}
                                            {customer.phone && (
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                                    {customer.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {customer.total_orders || 0} orders
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {customer.total_spent
                                                ? `₹${customer.total_spent.toLocaleString()}`
                                                : "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                            {new Date(customer.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
