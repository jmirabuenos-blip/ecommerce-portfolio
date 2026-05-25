// app/admin/orders/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { animate, createTimeline } from "animejs";
import AdminGuard from "@/components/AdminGuard";
import OrdersTable from "@/components/admin/OrdersTable";
import Link from "next/link";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface Order {
  id: string;
  shippingName: string | null;
  shippingEmail: string | null;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load orders.");
        setLoading(false);
      });
  }, []);

  // Animate once orders are loaded
  useEffect(() => {
    if (loading || hasAnimated.current) return;
    hasAnimated.current = true;

    const tl = createTimeline({ defaults: { ease: "outExpo" } });

    if (headerRef.current) {
      tl.add(headerRef.current, {
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 600,
      });
    }

    if (tableRef.current) {
      tl.add(tableRef.current, {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
      }, "-=300");
    }

    // Table rows stagger in
    tl.add(".order-row", {
      opacity: [0, 1],
      translateX: [-20, 0],
      duration: 400,
      delay: (_el: Element, i: number) => i * 50,
      ease: "outExpo",
    }, "-=400");

  }, [loading]);

  // Flash row on status change
  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );

      // Flash the updated row green
      const row = document.querySelector(`[data-order-id="${orderId}"]`);
      if (row) {
        animate(row, {
          backgroundColor: ["#dcfce7", "#ffffff"],
          duration: 1200,
          ease: "outExpo",
        });
      }
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10">

          {/* Header */}
          <div
            ref={headerRef}
            style={{ opacity: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Manage and update the status of all customer orders.
              </p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 rounded-2xl p-6 text-sm">
              {error}
            </div>
          ) : (
            <div ref={tableRef} style={{ opacity: 0 }}>
              <OrdersTable orders={orders} onStatusChange={handleStatusChange} />
            </div>
          )}

        </div>
      </div>
    </AdminGuard>
  );
}