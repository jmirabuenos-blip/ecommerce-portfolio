"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

const STATUS_STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

const STATUS_LABELS: Record<string, string> = {
  PENDING:    "Pending",
  PROCESSING: "Processing",
  SHIPPED:    "Shipped",
  DELIVERED:  "Delivered",
  CANCELLED:  "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
  PROCESSING: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
  SHIPPED:    "text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800",
  DELIVERED:  "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800",
  CANCELLED:  "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
};

// SVG icons for each status — no emojis
function StatusIcon({ status, className = "w-3 h-3" }: { status: string; className?: string }) {
  if (status === "PENDING") return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
  if (status === "PROCESSING") return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
  if (status === "SHIPPED") return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
  if (status === "DELIVERED") return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
  if (status === "CANCELLED") return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
  return null;
}

function StatusProgress({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 mt-3">
        <StatusIcon status="CANCELLED" className="w-4 h-4 text-red-500" />
        <span className="text-sm font-medium text-red-500 dark:text-red-400">
          This order was cancelled
        </span>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        {STATUS_STEPS.map((step, idx) => {
          const isDone    = idx < currentIdx;
          const isActive  = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${isActive  ? "bg-gray-900 dark:bg-gray-100 border-gray-900 dark:border-gray-100 text-white dark:text-gray-900 scale-110" : ""}
                  ${isDone    ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300" : ""}
                  ${isPending ? "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600" : ""}
                `}>
                  {isDone ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : idx + 1}
                </div>
                <span className={`
                  text-[10px] mt-1 font-medium text-center leading-tight
                  ${isActive ? "text-gray-900 dark:text-gray-100" : isDone ? "text-gray-500 dark:text-gray-400" : "text-gray-300 dark:text-gray-600"}
                `}>
                  {STATUS_LABELS[step]}
                </span>
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`
                  flex-1 h-px mx-1 mb-4 transition-all
                  ${idx < currentIdx ? "bg-gray-400 dark:bg-gray-500" : "bg-gray-200 dark:bg-gray-700"}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrdersHistory() {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res  = await fetch("/api/orders");
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Failed to load orders."); return; }
        setOrders(data.orders);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gray-900 dark:border-gray-100 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 dark:text-gray-500 text-sm">Loading your orders…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center mx-auto">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">{error}</p>
          <Link
            href="/"
            className="inline-block bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">No orders yet</h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            You haven't placed any orders yet.
          </p>
          <Link
            href="/"
            className="inline-block bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-4">

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Orders</h1>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </span>
        </div>

        {orders.map((order) => {
          const isOpen = expanded === order.id;

          return (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden"
            >
              {/* Order header */}
              <button
                onClick={() => setExpanded(isOpen ? null : order.id)}
                aria-expanded={isOpen}
                className="w-full text-left px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono tracking-wide">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}{" "}
                      <span className="text-gray-400 dark:text-gray-500 font-normal">·</span>{" "}
                      <span className="tabular-nums">${order.totalAmount.toFixed(2)}</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day:   "numeric",
                        year:  "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`
                      inline-flex items-center gap-1.5
                      text-xs font-semibold px-2.5 py-1 rounded-full border
                      ${STATUS_COLORS[order.status]}
                    `}>
                      <StatusIcon status={order.status} />
                      {STATUS_LABELS[order.status]}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <StatusProgress status={order.status} />
              </button>

              {/* Expanded details */}
              {isOpen && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-5 space-y-5">

                  {/* Items */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                      Items Ordered
                    </h3>
                    <ul className="divide-y divide-gray-50 dark:divide-gray-800">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-4 py-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            {item.product.images?.[0] ? (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                                  <rect x="3" y="3" width="18" height="18" rx="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <path d="M21 15l-5-5L5 21" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Shipping + Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm space-y-0.5">
                      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-xs uppercase tracking-wide">
                        Shipping To
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">{order.shippingName}</p>
                      <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {order.shippingCity}, {order.shippingState} {order.shippingZip}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">{order.shippingCountry}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm space-y-1.5">
                      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-xs uppercase tracking-wide">
                        Order Summary
                      </p>
                      <div className="flex justify-between text-gray-500 dark:text-gray-400">
                        <span>Subtotal</span>
                        <span className="tabular-nums">${(order.totalAmount - 9.99).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 dark:text-gray-400">
                        <span>Shipping</span>
                        <span className="tabular-nums">$9.99</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span>Total</span>
                        <span className="tabular-nums">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <Link
                      href={`/order-confirmation/${order.id}`}
                      className="
                        flex-1 text-center
                        border border-gray-200 dark:border-gray-700
                        text-gray-700 dark:text-gray-300
                        font-semibold py-2.5 rounded-xl
                        hover:bg-gray-50 dark:hover:bg-gray-800
                        transition-colors text-sm
                      "
                    >
                      View Details
                    </Link>
                    <Link
                      href="/"
                      className="
                        flex-1 text-center
                        bg-gray-900 dark:bg-gray-100
                        text-white dark:text-gray-900
                        font-semibold py-2.5 rounded-xl
                        hover:opacity-80
                        transition-opacity text-sm
                      "
                    >
                      Shop Again
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}