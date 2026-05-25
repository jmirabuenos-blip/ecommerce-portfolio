// components/admin/ProductsTable.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Product } from "@/lib/types";
import { animate } from "animejs";

interface ProductsTableProps {
  products: (Product & { averageRating?: number; reviewCount?: number })[];
  onDelete: (productId: string) => Promise<void>;
  onEdit: (product: Product) => void;
}

export default function ProductsTable({ products, onDelete, onEdit }: ProductsTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeleting(productId);

    const wrapper = rowRefs.current.get(productId);
    if (wrapper) {
      await new Promise<void>((resolve) => {
        animate(wrapper, {
          opacity: [1, 0],
          translateX: [0, 40],
          maxHeight: [wrapper.offsetHeight, 0],
          overflow: "hidden",
          duration: 400,
          ease: "outExpo",
          onComplete: () => resolve(),
        });
      });
    }

    // Optimistically hide the row BEFORE the async call can trigger a re-render
    setDeletedIds((prev) => new Set(prev).add(productId));

    try {
      await onDelete(productId);
    } catch (err) {
      // Rollback: un-hide the row if the delete failed
      setDeletedIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      // Restore row visibility
      const wrapper = rowRefs.current.get(productId);
      if (wrapper) {
        animate(wrapper, {
          opacity: [0, 1],
          translateX: [40, 0],
          maxHeight: [0, wrapper.scrollHeight],
          duration: 300,
          ease: "outExpo",
        });
      }
      console.error("Failed to delete product:", err);
    } finally {
      setDeleting(null);
    }
  };

  const visibleProducts = products.filter((p) => !deletedIds.has(p.id));

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[56px_1fr_120px_80px_60px_140px_100px] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100">
        {["Image", "Name", "Category", "Price", "Stock", "Rating", "Actions"].map((h) => (
          <div key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {visibleProducts.length === 0 ? (
        <p className="text-center text-gray-400 py-10 text-sm">No products found.</p>
      ) : (
        visibleProducts.map((product) => (
          <div
            key={product.id}
            data-product-id={product.id}
            className="product-row"
            ref={(el) => {
              if (el) rowRefs.current.set(product.id, el);
              else rowRefs.current.delete(product.id);
            }}
            style={{ overflow: "hidden" }}
          >
            <div className="grid grid-cols-[56px_1fr_120px_80px_60px_140px_100px] gap-4 px-4 py-3 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors">
              {/* Image */}
              <div>
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover w-12 h-12"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">
                    No img
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-400 font-mono">{product.id.slice(0, 8)}…</p>
              </div>

              {/* Category */}
              <div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
              </div>

              {/* Price */}
              <div className="text-sm font-semibold text-gray-900">
                ${product.price.toFixed(2)}
              </div>

              {/* Stock */}
              <div>
                <span
                  className={`text-sm font-medium ${
                    product.stock === 0
                      ? "text-red-500"
                      : product.stock < 10
                      ? "text-yellow-500"
                      : "text-green-600"
                  }`}
                >
                  {product.stock}
                </span>
              </div>

              {/* Rating */}
              <div>
                {typeof product.averageRating === "number" ? (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= Math.round(product.averageRating!)
                              ? "text-yellow-400"
                              : "text-gray-200"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {product.averageRating.toFixed(1)}
                      <span className="text-gray-400 ml-1">({product.reviewCount ?? 0})</span>
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">No reviews</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(product)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={deleting === product.id}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-medium transition-colors disabled:opacity-50"
                >
                  {deleting === product.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}