"use client";

import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";

interface Product {
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

interface HomeClientProps {
  products: Product[];
}

const SORT_OPTIONS = [
  { label: "Name: A–Z",       value: "name-asc"    },
  { label: "Name: Z–A",       value: "name-desc"   },
  { label: "Price: low–high", value: "price-asc"   },
  { label: "Price: high–low", value: "price-desc"  },
  { label: "Top rated",       value: "rating-desc" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export default function HomeClient({ products }: HomeClientProps) {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");
  const [sort,     setSort]     = useState<SortValue>("name-asc");

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category))).sort();
    return ["All", ...unique];
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (category !== "All")
      list = list.filter((p) => p.category === category);

    if (search.trim())
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );

    switch (sort) {
      case "name-asc":    list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc":   list.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "price-asc":   list.sort((a, b) => a.price - b.price); break;
      case "price-desc":  list.sort((a, b) => b.price - a.price); break;
      case "rating-desc": list.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0)); break;
    }

    return list;
  }, [products, category, search, sort]);

  const isFiltered = search.trim() !== "" || category !== "All";

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            All products
          </h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            {isFiltered
              ? `${filtered.length} of ${products.length} items`
              : `${products.length} items`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
              className="
                w-full pl-9 pr-3 py-2 text-sm rounded-xl
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-700
                text-gray-900 dark:text-gray-100
                placeholder:text-gray-400 dark:placeholder:text-gray-600
                focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100
                transition-colors
              "
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category pills */}
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                aria-pressed={category === cat}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150
                  ${category === cat
                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                  }
                `}
              >
                {cat}
              </button>
            ))}

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              aria-label="Sort products"
              className="
                ml-auto text-xs rounded-xl px-3 py-1.5
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-700
                text-gray-700 dark:text-gray-300
                focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100
                transition-colors cursor-pointer
              "
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid or empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-1">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No products found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Try adjusting your search or filters.</p>
            <button
              onClick={() => { setSearch(""); setCategory("All"); }}
              className="
                mt-2 text-xs font-medium px-4 py-2 rounded-xl
                bg-gray-900 dark:bg-gray-100
                text-white dark:text-gray-900
                hover:opacity-90
                transition-opacity
              "
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}