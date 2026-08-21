"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HiOutlineMinus, HiOutlinePlus, HiOutlineTrash, HiOutlineShoppingBag } from "react-icons/hi2";
import {
  fetchCart,
  fetchProducts,
  getStoredToken,
  removeCartItem,
  updateCartItem,
  type Cart,
} from "../../lib/api";
import { getGuestCart, removeGuestCartItem, updateGuestCartItem } from "../../lib/guestCart";

interface DisplayLine {
  key: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const isGuest = typeof window !== "undefined" && !getStoredToken();
  const [cart, setCart] = useState<Cart | null>(null);
  const [guestLines, setGuestLines] = useState<DisplayLine[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadGuestCart() {
    const lines = getGuestCart();
    if (lines.length === 0) {
      setGuestLines([]);
      return;
    }
    const products = await fetchProducts();
    const byId = new Map(products.map((p) => [p.id, p]));
    setGuestLines(
      lines
        .map((l) => {
          const product = byId.get(l.productId);
          if (!product) return null;
          return {
            key: l.productId,
            productId: l.productId,
            name: product.name,
            image: product.images[0] || "https://picsum.photos/seed/" + l.productId + "/200/200",
            price: product.price,
            quantity: l.quantity,
          };
        })
        .filter((l): l is DisplayLine => l !== null),
    );
  }

  useEffect(() => {
    if (getStoredToken()) {
      fetchCart()
        .then(setCart)
        .finally(() => setLoading(false));
    } else {
      loadGuestCart().finally(() => setLoading(false));
    }
  }, []);

  async function handleQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;
    setBusyId(itemId);
    try {
      if (isGuest) {
        updateGuestCartItem(itemId, quantity);
        await loadGuestCart();
      } else {
        setCart(await updateCartItem(itemId, quantity));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(itemId: string) {
    setBusyId(itemId);
    try {
      if (isGuest) {
        removeGuestCartItem(itemId);
        await loadGuestCart();
      } else {
        setCart(await removeCartItem(itemId));
      }
    } finally {
      setBusyId(null);
    }
  }

  const lines: DisplayLine[] =
    guestLines ??
    (cart?.items.map((item) => ({
      key: item.id,
      productId: item.productId,
      name: item.variant
        ? `${item.product.name} (${[item.variant.size, item.variant.color].filter(Boolean).join(" / ")})`
        : item.product.name,
      image: item.product.images[0] || "https://picsum.photos/seed/" + item.productId + "/200/200",
      price: item.variant?.priceOverride ?? item.product.price,
      quantity: item.quantity,
    })) ??
    []);

  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white">
        <p className="text-sm text-zinc-500">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-extrabold">Your Cart</h1>

        {lines.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-dashed border-zinc-300 p-10 text-center">
            <HiOutlineShoppingBag className="text-4xl text-zinc-300" />
            <p className="text-sm text-zinc-500">Your cart is empty.</p>
            <Link href="/" className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-black hover:bg-amber-300">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-col gap-4">
              {lines.map((item) => (
                <div key={item.key} className="flex items-center gap-4 rounded-xl border border-zinc-200 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{item.name}</div>
                    <div className="mt-1 text-sm text-zinc-600">₹{item.price}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        disabled={busyId === item.key}
                        onClick={() => handleQuantity(isGuest ? item.productId : item.key, item.quantity - 1)}
                        className="grid h-7 w-7 place-items-center rounded-full border border-zinc-300 disabled:opacity-50"
                      >
                        <HiOutlineMinus className="text-xs" />
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        disabled={busyId === item.key}
                        onClick={() => handleQuantity(isGuest ? item.productId : item.key, item.quantity + 1)}
                        className="grid h-7 w-7 place-items-center rounded-full border border-zinc-300 disabled:opacity-50"
                      >
                        <HiOutlinePlus className="text-xs" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-bold">₹{item.price * item.quantity}</span>
                    <button
                      disabled={busyId === item.key}
                      onClick={() => handleRemove(isGuest ? item.productId : item.key)}
                      className="text-zinc-400 hover:text-red-600 disabled:opacity-50"
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {isGuest && (
              <p className="mt-4 text-xs text-zinc-500">
                Shopping as a guest.{" "}
                <Link href="/login" className="font-semibold text-amber-600 hover:underline">
                  Sign in
                </Link>{" "}
                to save your cart across devices.
              </p>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-4">
              <span className="text-lg font-bold">Total: ₹{total}</span>
              <Link
                href="/checkout"
                className="rounded-full bg-amber-400 px-8 py-3 font-semibold text-black hover:bg-amber-300"
              >
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
