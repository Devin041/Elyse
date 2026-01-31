"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Package, User, MapPin, CreditCard } from "lucide-react";
import Link from "next/link";

interface OrderDetails {
    id: string;
    order_number: string;
    user_email: string;
    total_amount: number;
    subtotal: number;
    tax_amount: number;
    shipping_cost: number;
    status: string;
    payment_status: string;
    payment_method: string;
    created_at: string;
    items: Array<{
        id: string;
        product_name: string;
        variant_sku: string;
        quantity: number;
        price_at_purchase: number;
        size: string;
        color_name?: string;
        size_name?: string;
        image_url?: string; // Added image_url
    }>;
    shipping_address: {
        first_name: string;
        last_name: string;
        address_line1: string;
        address_line2?: string;
        city: string;
        state: string;
        postal_code: string;
        phone: string;
    };
}

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/orders/${orderId}`);
            setOrder(data.data);
        } catch (error) {
            toast.error("Failed to fetch order");
            router.push("/orders");
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (newStatus: string) => {
        if (!order) return;

        setUpdating(true);
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            setOrder({ ...order, status: newStatus });
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800",
            processing: "bg-blue-100 text-blue-800",
            shipped: "bg-purple-100 text-purple-800",
            delivered: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    if (loading || !order) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <Link
                    href="/orders"
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Orders
                </Link>
                <div className="mt-2 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Order #{order.order_number}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Placed on {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                    <span
                        className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(
                            order.status
                        )}`}
                    >
                        {order.status.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <Package className="h-5 w-5 text-gray-400 mr-2" />
                            <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {order.items.map((item) => (
                                <div key={item.id} className="py-4 flex justify-between">
                                    <div className="flex items-start">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                                            <img
                                                src={item.image_url || "/placeholder-product.png"}
                                                alt={item.product_name}
                                                className="h-full w-full object-cover object-center"
                                                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-product.png" }}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {item.product_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {item.color_name && `Color: ${item.color_name} • `}
                                                {item.size_name && `Size: ${item.size_name}`}
                                                {item.variant_sku && ` • SKU: ${item.variant_sku}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            ₹{item.price_at_purchase} × {item.quantity}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            ₹{item.price_at_purchase * item.quantity}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-900">₹{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tax (GST)</span>
                                <span className="text-gray-900">₹{order.tax_amount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Shipping</span>
                                <span className="text-gray-900">
                                    {order.shipping_cost === 0 ? "FREE" : `₹${order.shipping_cost}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-base font-medium border-t pt-2">
                                <span>Total</span>
                                <span>₹{order.total_amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Shipping */}
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center mb-3">
                                    <User className="h-5 w-5 text-gray-400 mr-2" />
                                    <h3 className="text-sm font-medium text-gray-900">Customer</h3>
                                </div>
                                <p className="text-sm text-gray-900">{order.user_email}</p>
                            </div>
                            <div>
                                <div className="flex items-center mb-3">
                                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                                    <h3 className="text-sm font-medium text-gray-900">Shipping Address</h3>
                                </div>
                                {order.shipping_address && (
                                    <address className="text-sm text-gray-900 not-italic">
                                        {order.shipping_address.first_name} {order.shipping_address.last_name}
                                        <br />
                                        {order.shipping_address.address_line1}
                                        <br />
                                        {order.shipping_address.address_line2 && (
                                            <>
                                                {order.shipping_address.address_line2}
                                                <br />
                                            </>
                                        )}
                                        {order.shipping_address.city}, {order.shipping_address.state}{" "}
                                        {order.shipping_address.postal_code}
                                        <br />
                                        Phone: {order.shipping_address.phone}
                                    </address>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <div className="flex items-center mb-3">
                            <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                            <h3 className="text-sm font-medium text-gray-900">Payment</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Method</p>
                                <p className="text-sm text-gray-900">{order.payment_method || "COD"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <span
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.payment_status === "paid"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                        }`}
                                >
                                    {order.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Status Management */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow sm:rounded-lg p-6 sticky top-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Update Status</h2>
                        <div className="space-y-2">
                            {["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => updateOrderStatus(status)}
                                    disabled={updating || order.status === status}
                                    className={`w-full text-left px-4 py-2 text-sm rounded-md border ${order.status === status
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        } disabled:opacity-50 capitalize`}
                                >
                                    {updating && order.status !== status ? (
                                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                    ) : null}
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
