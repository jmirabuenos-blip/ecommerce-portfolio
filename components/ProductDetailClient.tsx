"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import ReviewList from "./ReviewList";

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

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    stock: number;
  };
  averageRating: number;
  reviews: Review[];
}

export default function ProductDetailClient({
  product,
  averageRating,
  reviews,
}: ProductDetailClientProps) {
  const inStock = product.stock > 0;
  const hasImages = product.images.length > 0;
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-10" aria-label="Breadcrumb">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-150"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to storefront
          </Link>
        </nav>

        {/* Main grid */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-14 lg:items-start">

          {/* ── Images ── */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              {hasImages ? (
                <Image
                  src={product.images[activeImage]}
                  alt={`${product.name} — image ${activeImage + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-opacity duration-200"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200 dark:text-gray-700">
                  <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails — only show if more than 1 image */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`
                      relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-150
                      ${activeImage === i
                        ? "border-gray-900 dark:border-gray-100"
                        : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                      }
                    `}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} thumbnail ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="mt-10 lg:mt-0 flex flex-col gap-5">

            {/* Category */}
            <span className="w-fit text-[11px] font-semibold tracking-widest uppercase text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {product.category}
            </span>

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-gray-900 dark:text-gray-100">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-3xl font-bold tracking-tight tabular-nums text-gray-900 dark:text-gray-100">
              ${product.price.toFixed(2)}
            </p>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-4 h-4"
                      fill={star <= Math.round(averageRating) ? "#D97706" : "none"}
                      stroke={star <= Math.round(averageRating) ? "#D97706" : "#D1D5DB"}
                      strokeWidth={1.5}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span
                  className="text-sm text-gray-500 dark:text-gray-400 tabular-nums"
                  aria-label={`${averageRating.toFixed(1)} out of 5, ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`}
                >
                  {averageRating.toFixed(1)}
                  <span className="mx-1.5 text-gray-300 dark:text-gray-600">·</span>
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-gray-100 dark:bg-gray-800" />

            {/* Description */}
            <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
              {product.description}
            </p>

            {/* Stock status */}
            <div className={`
              w-fit inline-flex items-center gap-2 text-xs font-semibold
              px-3 py-1.5 rounded-full
              ${inStock
                ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900"
                : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900"
              }
            `}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${inStock ? "bg-green-500" : "bg-red-500"}`} />
              {inStock ? `${product.stock} in stock` : "Out of stock"}
            </div>

            {/* Add to cart */}
            <div className="pt-1">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.images[0] ?? "",
                }}
              />
            </div>

          </div>
        </div>

        {/* Reviews */}
        <div className="mt-20 pt-12 border-t border-gray-100 dark:border-gray-800">
          <ReviewList productId={product.id} initialReviews={reviews} />
        </div>

      </div>
    </div>
  );
}