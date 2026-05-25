"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingName: string;
  shippingEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  createdAt: string;
  items: OrderItem[];
}

interface Props {
  orderId: string;
}

export default function OrderConfirmation({ orderId }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const clearedRef = useRef(false);

  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  useEffect(() => {
    if (paymentIntent && !clearedRef.current) {
      clearedRef.current = true;
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentIntent]);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load order.");
          return;
        }

        setOrder(data.order);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading your order…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-2xl">😕</p>
          <p className="text-gray-700 font-medium">{error || "Order not found."}</p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const shipping = order.totalAmount > 0 ? 9.99 : 0;

  // ── Payment Failed ───────────────────────────────────────────────
  if (redirectStatus === "failed") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
          <p className="text-gray-500 text-sm">
            Your payment could not be processed. Your order has been cancelled.
          </p>
          <p className="text-xs font-mono text-gray-400">Order ID: {order.id}</p>
          <Link
            href="/checkout"
            className="inline-block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            Try Again
          </Link>
        </div>
      </main>
    );
  }

  // ── Confirmed ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Success banner */}
        <div className="bg-white border border-green-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 text-sm">
            Thanks,{" "}
            <span className="font-medium text-gray-700">
              {order.shippingName}
            </span>
            ! A confirmation has been sent to{" "}
            <span className="font-medium text-gray-700">
              {order.shippingEmail}
            </span>
            .
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Order ID:{" "}
            <span className="font-mono text-gray-500">{order.id}</span>
          </p>
        </div>

        {/* Payment status notice */}
        {order.paymentStatus === "UNPAID" && redirectStatus === "succeeded" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800 text-center">
            Payment received — your order status will update shortly.
          </div>
        )}

        {/* Order items */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Items Ordered</h2>

          <ul className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3">
                {item.product.images?.[0] && (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>

          {/* Totals */}
          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${(order.totalAmount - shipping).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping details */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Shipping To
          </h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-800">{order.shippingName}</p>
            <p>{order.shippingAddress}</p>
            <p>
              {order.shippingCity}, {order.shippingState} {order.shippingZip}
            </p>
            <p>{order.shippingCountry}</p>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Order Status</p>
            <p className="font-semibold text-gray-800 mt-0.5">{order.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment</p>
            <p
              className={`font-semibold mt-0.5 ${
                order.paymentStatus === "PAID"
                  ? "text-green-600"
                  : order.paymentStatus === "FAILED"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {order.paymentStatus}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-semibold text-gray-800 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 text-center border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition text-sm"
          >
            Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            View All Orders
          </Link>
        </div>

      </div>
    </main>
  );
}