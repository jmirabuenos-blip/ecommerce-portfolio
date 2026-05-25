// components/ReviewForm.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

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

interface ReviewFormProps {
  productId: string;
  existingReview?: Review | null;
  onReviewSubmitted: (review: Review) => void;
  onCancelEdit?: () => void;
}

const MAX_COMMENT = 1000;

const LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

export default function ReviewForm({
  productId,
  existingReview,
  onReviewSubmitted,
  onCancelEdit,
}: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating,  setRating]  = useState(existingReview?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const isEditing      = !!existingReview;
  const displayRating  = hovered || rating;
  const charsLeft      = MAX_COMMENT - comment.length;
  const isNearLimit    = charsLeft <= 100;

  // Not signed in
  if (!session?.user) {
    return (
      <div className="
        rounded-xl px-4 py-3 text-sm
        bg-gray-50 dark:bg-gray-900
        border border-gray-100 dark:border-gray-800
        text-gray-500 dark:text-gray-400
      ">
        <a
          href="/login"
          className="font-medium text-gray-900 dark:text-gray-100 underline underline-offset-2"
        >
          Sign in
        </a>{" "}
        to leave a review.
      </div>
    );
  }

  const handleSubmit = async () => {
    setError("");

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (comment.trim().length === 0) {
      setError("Please write a comment.");
      return;
    }
    if (comment.length > MAX_COMMENT) {
      setError(`Comment must be ${MAX_COMMENT} characters or fewer.`);
      return;
    }

    setLoading(true);
    try {
      const url    = isEditing ? `/api/reviews/${existingReview.id}` : "/api/reviews";
      const method = isEditing ? "PATCH" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      onReviewSubmitted(data);

      if (!isEditing) {
        setRating(0);
        setComment("");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="
      rounded-xl p-5
      bg-white dark:bg-gray-900
      border border-gray-100 dark:border-gray-800
    ">
      <h3 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 mb-5">
        {isEditing ? "Edit your review" : "Write a review"}
      </h3>

      {/* Star picker */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          Your rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`Rate ${star} out of 5`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-gray-100 rounded transition-transform hover:scale-110"
            >
              <svg
                className={`w-7 h-7 transition-colors ${
                  star <= displayRating
                    ? "text-yellow-400"
                    : "text-gray-200 dark:text-gray-700"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}

          {displayRating > 0 && (
            <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              {LABELS[displayRating]}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label
          htmlFor="review-comment"
          className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2"
        >
          Your review
        </label>
        <textarea
          id="review-comment"
          rows={4}
          value={comment}
          maxLength={MAX_COMMENT}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product…"
          className="
            w-full rounded-lg px-3 py-2 text-sm resize-none
            bg-white dark:bg-gray-950
            border border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-600
            focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-0
            transition-colors
          "
        />
        <p className={`mt-1 text-[11px] text-right tabular-nums transition-colors ${
          isNearLimit
            ? "text-red-500 dark:text-red-400"
            : "text-gray-400 dark:text-gray-600"
        }`}>
          {charsLeft} remaining
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="
          mb-4 text-xs px-3 py-2 rounded-lg
          text-red-600 dark:text-red-400
          bg-red-50 dark:bg-red-950
          border border-red-100 dark:border-red-900
        ">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="
            px-4 py-2 rounded-lg text-xs font-semibold
            bg-gray-900 dark:bg-gray-100
            text-white dark:text-gray-900
            hover:bg-gray-700 dark:hover:bg-white
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {loading
            ? isEditing ? "Saving…" : "Submitting…"
            : isEditing ? "Save changes" : "Submit review"}
        </button>

        {isEditing && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={loading}
            className="
              px-4 py-2 rounded-lg text-xs font-semibold
              text-gray-500 dark:text-gray-400
              hover:text-gray-900 dark:hover:text-gray-100
              disabled:opacity-50
              transition-colors
            "
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}