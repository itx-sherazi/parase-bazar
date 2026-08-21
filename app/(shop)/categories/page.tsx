"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { fetchCategories, type Category } from "../../lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen w-full bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">Shop by</p>
        <h1 className="mt-1 text-3xl font-extrabold text-zinc-900">Categories</h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-500">
          Browse everything we sell — from fashion and electronics to groceries and home essentials.
        </p>

        {loading ? (
          <p className="mt-10 text-sm text-zinc-400">Loading categories…</p>
        ) : categories.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-200 px-6 py-16 text-center">
            <HiOutlineSquares2X2 className="mx-auto text-3xl text-zinc-300" />
            <p className="mt-3 text-sm text-zinc-500">Categories will appear here once the store catalog is ready.</p>
            <Link href="/" className="mt-4 inline-block text-sm font-semibold text-amber-500 hover:text-amber-600">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6 transition hover:border-amber-200 hover:bg-amber-50"
              >
                <h2 className="text-lg font-bold text-zinc-900">{category.name}</h2>
                {category.children.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {category.children.map((child) => (
                      <li key={child.id} className="text-sm text-zinc-600">
                        {child.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-zinc-500">Explore this collection on the homepage.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
