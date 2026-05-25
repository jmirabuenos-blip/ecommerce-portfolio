"use client";

import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  averageRating?: number;
  reviewCount?: number;
}

function StarRating({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={11}
          height={11}
          viewBox="0 0 20 20"
          fill={star <= rounded ? "#D97706" : "none"}
          stroke={star <= rounded ? "#D97706" : "#D1D5DB"}
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-1 tabular-nums">
        {reviewCount > 0
          ? `${rating.toFixed(1)} (${reviewCount.toLocaleString()})`
          : "No reviews"}
      </span>
    </div>
  );
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  category,
  images,
  stock,
  averageRating,
  reviewCount,
}: ProductCardProps) {
  return (
    <Link
      href={`/product/${id}`}
      className="
        group flex flex-col
        bg-white dark:bg-gray-900
        border border-gray-100 dark:border-gray-800
        rounded-2xl overflow-hidden
        transition-all duration-200 ease-out
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]
        hover:-translate-y-0.5
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-gray-100
      "
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
        {images?.[0] ? (
          <Image
            src={images[0]}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Category badge */}
        <span className="
          absolute top-3 left-3
          bg-white/90 dark:bg-gray-900/90
          backdrop-blur-sm
          text-gray-600 dark:text-gray-300
          text-[10px] font-semibold tracking-[0.07em] uppercase
          px-2.5 py-1 rounded-full
          border border-black/[0.06] dark:border-white/[0.08]
        ">
          {category}
        </span>

        {/* Out of stock overlay */}
        {stock === 0 && (
          <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* Name */}
        <h3 className="
          text-sm font-semibold leading-snug
          text-gray-900 dark:text-gray-100
          line-clamp-2
        ">
          {name}
        </h3>

        {/* Description */}
        <p className="
          text-xs text-gray-400 dark:text-gray-500
          leading-relaxed line-clamp-2
        ">
          {description}
        </p>

        {/* Rating */}
        {typeof averageRating === "number" && reviewCount !== undefined && (
          <StarRating rating={averageRating} reviewCount={reviewCount} />
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Divider */}
        <div className="h-px bg-gray-100 dark:bg-gray-800" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100">
            ${price.toFixed(2)}
          </span>

          <span className="
            inline-flex items-center gap-1.5
            text-[11px] font-semibold
            text-gray-500 dark:text-gray-400
            group-hover:text-gray-900 dark:group-hover:text-gray-100
            transition-colors duration-150
          ">
            View
            <svg
              width={11}
              height={11}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}