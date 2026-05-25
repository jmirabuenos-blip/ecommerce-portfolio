// components/StarRating.tsx
"use client";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
}

const sizeMap = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const textSizeMap = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export default function StarRating({
  rating,
  max = 5,
  size = "md",
  showValue = false,
  count,
}: StarRatingProps) {
  const starSize  = sizeMap[size];
  const textSize  = textSizeMap[size];

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`${rating.toFixed(1)} out of ${max} stars${count !== undefined ? `, ${count} ${count === 1 ? "review" : "reviews"}` : ""}`}
    >
      <div className="flex items-center" aria-hidden="true">
        {Array.from({ length: max }, (_, i) => {
          const filled    = i + 1 <= Math.floor(rating);
          const partial   = !filled && i < rating && rating % 1 !== 0;
          const percentage = partial ? Math.round((rating % 1) * 100) : 0;

          return (
            <span key={i} className={`relative inline-block ${starSize}`}>
              {/* Empty star */}
              <svg
                className={`${starSize} text-gray-200 dark:text-gray-700`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>

              {/* Filled / partial star */}
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? "100%" : `${percentage}%` }}
                >
                  <svg
                    className={`${starSize} text-yellow-400`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </span>
              )}
            </span>
          );
        })}
      </div>

      {(showValue || count !== undefined) && (
        <span className={`${textSize} text-gray-400 dark:text-gray-500`} aria-hidden="true">
          {showValue && (
            <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">
              {rating.toFixed(1)}
            </span>
          )}
          {showValue && count !== undefined && (
            <span className="mx-1 text-gray-300 dark:text-gray-600">·</span>
          )}
          {count !== undefined && (
            <span className="tabular-nums">
              {count.toLocaleString()} {count === 1 ? "review" : "reviews"}
            </span>
          )}
        </span>
      )}
    </div>
  );
}