// app/admin/reviews/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { animate, createTimeline } from "animejs";
import AdminGuard from "@/components/AdminGuard";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  product: {
    id: string;
    name: string;
  };
}

interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  pages: number;
}

export default function AdminReviewsPage() {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const fetchReviews = (p: number) => {
    setLoading(true);
    fetch(`/api/admin/reviews?page=${p}&limit=20`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load reviews.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  // Animate once on first load
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

    tl.add(".review-row", {
      opacity: [0, 1],
      translateX: [-20, 0],
      duration: 400,
      delay: (_el: Element, i: number) => i * 50,
      ease: "outExpo",
    }, "-=400");
  }, [loading]);

  const handleDelete = async (reviewId: string) => {
    setDeletingId(reviewId);

    // Animate row out before deleting
    const row = document.querySelector(`[data-review-id="${reviewId}"]`);
    if (row) {
      await new Promise<void>((resolve) => {
        animate(row, {
          opacity: [1, 0],
          translateX: [0, 40],
          height: [row.clientHeight, 0],
          marginBottom: [0, 0],
          duration: 400,
          ease: "outExpo",
          onComplete: () => resolve(),
        });
      });
    }

    const res = await fetch(`/api/admin/reviews?reviewId=${reviewId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews.filter((r) => r.id !== reviewId),
              total: prev.total - 1,
            }
          : prev
      );
    }

    setDeletingId(null);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? "text-amber-400" : "text-gray-200"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
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
              <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
              <p className="text-gray-500 mt-1 text-sm">
                {data ? `${data.total} review${data.total !== 1 ? "s" : ""} across all products` : "Loading..."}
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
                  className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 rounded-2xl p-6 text-sm">
              {error}
            </div>
          ) : data && data.reviews.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-400 text-sm">No reviews yet.</p>
            </div>
          ) : (
            <div ref={tableRef} style={{ opacity: 0 }}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        User
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Product
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Rating
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Comment
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Date
                      </th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data?.reviews.map((review) => (
                      <tr
                        key={review.id}
                        data-review-id={review.id}
                        className="review-row hover:bg-gray-50 transition-colors"
                        style={{ opacity: 0 }}
                      >
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {review.user.image ? (
                              <img
                                src={review.user.image}
                                alt={review.user.name ?? ""}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                {review.user.name?.[0]?.toUpperCase() ?? "?"}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 text-xs">
                                {review.user.name ?? "Unknown"}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {review.user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Product */}
                        <td className="px-6 py-4">
                          <Link
                            href={`/product/${review.product.id}`}
                            className="text-indigo-600 hover:underline text-xs font-medium"
                          >
                            {review.product.name}
                          </Link>
                        </td>

                        {/* Rating */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-0.5">
                            {renderStars(review.rating)}
                          </div>
                        </td>

                        {/* Comment */}
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-gray-600 text-xs line-clamp-2">
                            {review.comment}
                          </p>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Delete */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(review.id)}
                            disabled={deletingId === review.id}
                            className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
                          >
                            {deletingId === review.id ? "Deleting…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-xs text-gray-400">
                    Page {data.page} of {data.pages} — {data.total} total reviews
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                      disabled={page === data.pages}
                      className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </AdminGuard>
  );
}