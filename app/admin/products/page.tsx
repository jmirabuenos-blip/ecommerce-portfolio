// app/admin/products/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { animate, createTimeline } from "animejs";
import AdminGuard from "@/components/AdminGuard";
import ProductsTable from "@/components/admin/ProductsTable";
import Link from "next/link";
import { Product } from "@/lib/types";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  images: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const headerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Entrance animation once loaded
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

    tl.add(".product-row", {
      opacity: [0, 1],
      translateX: [-20, 0],
      duration: 400,
      delay: (_el: Element, i: number) => i * 50,
      ease: "outExpo",
    }, "-=400");
  }, [loading]);

  // Animate form in when shown
  useEffect(() => {
    if (!showForm || !formRef.current) return;
    animate(formRef.current, {
      opacity: [0, 1],
      translateY: [-16, 0],
      scale: [0.98, 1],
      duration: 500,
      ease: "outExpo",
    });
  }, [showForm]);

  // Update image previews when images field changes
  useEffect(() => {
    const urls = form.images
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http"));
    setImagePreview(urls);
  }, [form.images]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      images: product.images.join(", "),
    });
    setShowForm(true);
    setFormError(null);
  };

  // ✅ No animation here — ProductsTable handles that.
  // Just do the fetch and update state.
  const handleDelete = async (productId: string) => {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      throw new Error("Delete failed"); // ProductsTable will catch this and rollback
    }
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!form.name || !form.description || !form.price || !form.category) {
      setFormError("Name, description, category and price are required.");

      if (formRef.current) {
        animate(formRef.current, {
          translateX: [0, -8, 8, -6, 6, -4, 4, 0],
          duration: 500,
          ease: "outExpo",
        });
      }
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: parseFloat(form.price),
      stock: parseInt(form.stock || "0"),
      images: form.images
        ? form.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };

    const res = await fetch(
      editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products",
      {
        method: editingProduct ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      await fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);
    } else {
      const data = await res.json();
      setFormError(data.error ?? "Failed to save product.");
    }
    setSaving(false);
  };

  const handleCancel = () => {
    if (formRef.current) {
      animate(formRef.current, {
        opacity: [1, 0],
        translateY: [0, -12],
        scale: [1, 0.97],
        duration: 300,
        ease: "outExpo",
        onComplete: () => {
          setShowForm(false);
          setEditingProduct(null);
          setForm(emptyForm);
          setFormError(null);
        },
      });
    } else {
      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);
      setFormError(null);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-300";

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
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Create, edit, and remove products from your catalog.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                ← Back to Dashboard
              </Link>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setForm(emptyForm);
                  setFormError(null);
                  setShowForm(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                + Add Product
              </button>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div
              ref={formRef}
              style={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingProduct ? "Edit Product" : "New Product"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {editingProduct
                      ? "Update the details below and save."
                      : "Fill in the details to add a new product."}
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors text-lg font-light"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Minimal Desk Lamp"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lighting"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Price <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      placeholder="49.99"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Stock
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                {/* Images */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Images{" "}
                    <span className="text-gray-400 font-normal normal-case">
                      (comma-separated URLs)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-xxx, https://..."
                    value={form.images}
                    onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
                    className={inputClass}
                  />

                  {/* Image previews */}
                  {imagePreview.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {imagePreview.map((url, i) => (
                        <div
                          key={i}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
                        >
                          <img
                            src={url}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-white drop-shadow">
                            {i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    placeholder="Write a short product description..."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              {formError && (
                <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-2.5 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {formError}
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  )}
                  {saving ? "Saving…" : editingProduct ? "Save Changes" : "Create Product"}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 rounded-2xl p-6 text-sm">
              {error}
            </div>
          ) : (
            <div ref={tableRef} style={{ opacity: 0 }}>
              <ProductsTable
                products={products}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          )}

        </div>
      </div>
    </AdminGuard>
  );
}