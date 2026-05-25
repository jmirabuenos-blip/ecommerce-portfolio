// app/admin/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { animate, createTimeline } from "animejs";
import AdminGuard from "@/components/AdminGuard";
import StatsCard from "@/components/admin/StatsCard";
import StatusBadge from "@/components/admin/StatusBadge";
import Link from "next/link";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalReviews: number;
  ordersByStatus: Record<string, number>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  // Animate once stats are loaded
  useEffect(() => {
    if (!stats || hasAnimated.current) return;
    hasAnimated.current = true;

    const tl = createTimeline({ defaults: { ease: "outExpo" } });

    // Header slides down
    if (headerRef.current) {
      tl.add(headerRef.current, {
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 600,
      });
    }

    // Stats cards stagger in
    tl.add(".stats-card", {
      opacity: [0, 1],
      translateY: [30, 0],
      scale: [0.95, 1],
      duration: 500,
      delay: (_el: Element, i: number) => i * 80,
      ease: "outBack",
    }, "-=300");

    // Status section slides up
    if (statusRef.current) {
      tl.add(statusRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
      }, "-=200");
    }

    // Status pills stagger
    tl.add(".status-pill", {
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 400,
      delay: (_el: Element, i: number) => i * 60,
      ease: "outBack",
    }, "-=300");

  }, [stats]);

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
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Welcome back — here's what's happening in your store.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/orders"
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Manage Orders
              </Link>
              <Link
                href="/admin/products"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Manage Products
              </Link>
            </div>
          </div>

          {/* Stats */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
              <div className="stats-card" style={{ opacity: 0 }}>
                <StatsCard
                  title="Total Revenue"
                  value={`$${stats.totalRevenue.toFixed(2)}`}
                  sub="From paid orders"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>
              <div className="stats-card" style={{ opacity: 0 }}>
                <StatsCard
                  title="Total Orders"
                  value={stats.totalOrders}
                  sub={`${stats.ordersByStatus?.PENDING ?? 0} pending`}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                />
              </div>
              <div className="stats-card" style={{ opacity: 0 }}>
                <StatsCard
                  title="Total Users"
                  value={stats.totalUsers}
                  sub="Registered accounts"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                />
              </div>
              <div className="stats-card" style={{ opacity: 0 }}>
                <StatsCard
                  title="Total Products"
                  value={stats.totalProducts}
                  sub="In your catalog"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                    </svg>
                  }
                />
              </div>
              <div className="stats-card" style={{ opacity: 0 }}>
                <StatsCard
                  title="Total Reviews"
                  value={stats.totalReviews}
                  sub="Across all products"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  }
                />
              </div>
            </div>
          ) : null}

          {/* Orders by Status */}
          {stats && (
            <div
              ref={statusRef}
              style={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="status-pill flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2"
                    style={{ opacity: 0 }}
                  >
                    <StatusBadge status={status as any} />
                    <span className="text-sm font-semibold text-gray-700">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </AdminGuard>
  );
}