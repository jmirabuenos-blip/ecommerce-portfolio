// components/ReviewList.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ReviewListProps {
  productId: string;
  initialReviews: Review[];
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);
  const months  = Math.floor(days / 30);
  const years   = Math.floor(days / 365);

  if (minutes < 1)  return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24)   return `${hours}h ago`;
  if (days < 30)    return `${days}d ago`;
  if (months < 12)  return `${months}mo ago`;
  return `${years}y ago`;
}

export default function ReviewList({ productId, initialReviews }: ReviewListProps) {
  const { data: session } = useSession();
  const [reviews,    setReviews]    = useState<Review[]>(initialReviews);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const userId      = session?.user?.id;
  const isAdmin     = session?.user?.role === "ADMIN";
  const hasReviewed = reviews.some((r) => r.user.id === userId);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const handleReviewSubmitted = (review: Review) => {
    setReviews((prev) => {
      const exists = prev.find((r) => r.id === review.id);
      return exists
        ? prev.map((r) => (r.id === review.id ? review : r))
        : [review, ...prev];
    });
    setEditingId(null);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Delete this review?")) return;
    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section aria-label="Customer reviews">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Customer reviews
      </h2>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 mb-8 p-5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          {/* Average score */}
          <div className="flex flex-col items-center justify-center min-w-[100px] gap-1">
            <span className="text-4xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {averageRating.toFixed(1)}
            </span>
            <StarRating rating={averageRating} size="md" />
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>

          {/* Bar breakdown */}
          <div className="flex-1 flex flex-col gap-2 justify-center">
            {ratingCounts.map(({ star, count }) => {
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-right text-gray-500 dark:text-gray-400 tabular-nums">
                    {star}
                  </span>
                  <svg
                    className="w-3 h-3 text-yellow-400 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div
                    className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={Math.round(pct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${star} star: ${count} reviews`}
                  >
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-5 text-gray-400 dark:text-gray-600 tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write a review */}
      {!hasReviewed && (
        <div className="mb-8">
          <ReviewForm
            productId={productId}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      )}

      {/* List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400 dark:text-gray-600 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
          No reviews yet — be the first to leave one.
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => {
            const isOwner   = review.user.id === userId;
            const isEditing = editingId === review.id;

            return (
              <li
                key={review.id}
                className="rounded-xl p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
              >
                {isEditing ? (
                  <ReviewForm
                    productId={productId}
                    existingReview={review}
                    onReviewSubmitted={handleReviewSubmitted}
                    onCancelEdit={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">

                        {/* Avatar */}
                        {review.user.image ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={review.user.image}
                              alt={review.user.name ?? "User avatar"}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            aria-hidden="true"
                          >
                            {getInitials(review.user.name)}
                          </div>
                        )}

                        <div>
                          <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100 leading-none mb-0.5">
                            {review.user.name ?? "Anonymous"}
                            {isOwner && (
                              <span className="ml-2 text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          <time
                            dateTime={review.createdAt}
                            className="text-[11px] text-gray-400 dark:text-gray-600"
                          >
                            {timeAgo(review.createdAt)}
                          </time>
                        </div>
                      </div>

                      {/* Owner / admin actions */}
                      {(isOwner || isAdmin) && (
                        <div className="flex items-center gap-3 shrink-0">
                          {isOwner && (
                            <button
                              onClick={() => setEditingId(review.id)}
                              className="text-[12px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(review.id)}
                            disabled={deletingId === review.id}
                            className="text-[12px] text-gray-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-40 transition-colors"
                          >
                            {deletingId === review.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stars */}
                    <StarRating rating={review.rating} size="sm" />

                    {/* Comment */}
                    {review.comment && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}