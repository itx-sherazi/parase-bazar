"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiOutlineHeart, HiOutlineShoppingBag, HiOutlineTrash } from "react-icons/hi2";
import { addToCart, fetchWishlist, getStoredToken, removeFromWishlist, type WishlistItem } from "../../lib/api";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[] | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!getStoredToken()) {
      window.location.href = "/login";
      return;
    }
    fetchWishlist()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  async function handleRemove(productId: string) {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
      setItems((prev) => prev?.filter((i) => i.productId !== productId) ?? null);
    } finally {
      setRemovingId(null);
    }
  }

  async function handleAddToCart(productId: string) {
    setAddingId(productId);
    try {
      await addToCart(productId, 1);
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-zinc-900">
        <HiOutlineHeart className="text-amber-500" /> My Wishlist
      </h1>

      {items === null ? (
        <p className="mt-8 text-sm text-zinc-500">Loading wishlist...</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-sm text-zinc-500">Your wishlist is empty.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-black hover:bg-amber-300"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map(({ product }) => (
            <div key={product.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <Link href={`/product/${product.slug}`} className="relative block aspect-square bg-zinc-100">
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-zinc-400">No image</div>
                )}
              </Link>
              <div className="p-3">
                <Link href={`/product/${product.slug}`} className="line-clamp-2 text-xs font-semibold text-zinc-800 hover:text-amber-600">
                  {product.name}
                </Link>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-sm font-bold">₹{product.price}</span>
                  {product.mrp && <span className="text-xs text-zinc-400 line-through">₹{product.mrp}</span>}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    disabled={addingId === product.id}
                    onClick={() => handleAddToCart(product.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-full bg-amber-400 px-2 py-1.5 text-[11px] font-semibold text-black hover:bg-amber-300 disabled:opacity-60"
                  >
                    <HiOutlineShoppingBag /> {addingId === product.id ? "Adding..." : "Add to Cart"}
                  </button>
                  <button
                    disabled={removingId === product.id}
                    onClick={() => handleRemove(product.id)}
                    title="Remove from wishlist"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-60"
                  >
                    <HiOutlineTrash className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
