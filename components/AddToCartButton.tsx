// components/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  disabled?: boolean;
}

export default function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [state, setState] = useState<"idle" | "added">("idle");

  const handleClick = () => {
    if (state !== "idle" || disabled) return;
    addToCart(product);
    setState("added");
    setTimeout(() => setState("idle"), 1800);
  };

  const isAdded = state === "added";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isAdded}
      aria-label={isAdded ? "Added to cart" : "Add to cart"}
      className={`
        relative w-full sm:max-w-xs
        inline-flex items-center justify-center gap-2
        px-8 py-3 rounded-xl
        text-sm font-semibold tracking-tight
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        active:scale-[0.98]
        ${disabled
          ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
          : isAdded
            ? "bg-green-600 dark:bg-green-500 text-white focus-visible:ring-green-600 cursor-default"
            : "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-white focus-visible:ring-gray-900 dark:focus-visible:ring-gray-100"
        }
      `}
    >
      {isAdded ? (
        <>
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Added to cart
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
          </svg>
          Add to cart
        </>
      )}
    </button>
  );
}