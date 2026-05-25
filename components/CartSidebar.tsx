// components/CartSidebar.tsx
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CartSidebar() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Close on Escape
  useEffect(() => {
    if (!isCartOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCartOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          animation: "slideIn 0.25s cubic-bezier(0.32, 0.72, 0, 1) both",
        }}
        className="relative flex flex-col w-full max-w-sm bg-white dark:bg-gray-950 border-l border-gray-100 dark:border-gray-800"
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to   { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <svg
              className="w-4 h-4 text-gray-700 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
              Your cart
            </h2>
            {itemCount > 0 && (
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5 leading-none">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-24 text-center px-8">
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your cart is empty
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Add items to get started.
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-1 text-xs font-semibold px-4 py-2 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-80 transition-opacity"
              >
                Browse products
              </button>
            </div>
          ) : (
            <ul>
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 px-5 py-4 border-b border-gray-50 dark:border-gray-800/60 last:border-0"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
                        {item.name}
                      </p>
                      <span className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0 tabular-nums">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      ${item.price.toFixed(2)} each
                    </p>

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-1">
                      {/* Qty stepper */}
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-sm font-medium"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-[12px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-sm font-medium"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[11px] text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 flex flex-col gap-3">
            {/* Summary rows */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="text-xs text-gray-700 dark:text-gray-300 tabular-nums">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Shipping</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-800" />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Total
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums tracking-tight">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            {/* CTA */}
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[13px] font-semibold tracking-tight hover:opacity-85 active:scale-[0.98] transition-all"
            >
              Proceed to checkout
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center">
              Taxes and shipping calculated at checkout
            </p>
          </div>
        )}
      </div>
    </div>
  );
}