"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  checkout,
  fetchCart,
  fetchProducts,
  getStoredToken,
  getStoredUser,
  guestCheckout,
  validateCoupon,
  type Cart,
  type CouponValidation,
  type JazzCashRedirect,
} from "../../lib/api";
import { clearGuestCart, getGuestCart, type GuestCartLine } from "../../lib/guestCart";

interface GuestLine extends GuestCartLine {
  name: string;
  price: number;
}

function redirectToJazzCash(jazzcash: JazzCashRedirect) {
  if (!jazzcash.hcpUrl) return;
  const form = document.createElement("form");
  form.method = "POST";
  form.action = jazzcash.hcpUrl;
  Object.entries(jazzcash.params).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutPage() {
  const router = useRouter();
  const isGuest = typeof window !== "undefined" && !getStoredToken();
  const [cart, setCart] = useState<Cart | null>(null);
  const [guestLines, setGuestLines] = useState<GuestLine[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "JAZZCASH">("COD");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    if (!getStoredToken()) {
      const cartLines = getGuestCart();
      if (cartLines.length === 0) {
        router.push("/cart");
        return;
      }
      fetchProducts()
        .then((products) => {
          const byId = new Map(products.map((p) => [p.id, p]));
          setGuestLines(
            cartLines
              .map((l): GuestLine | null => {
                const p = byId.get(l.productId);
                return p
                  ? { productId: l.productId, variantId: l.variantId, quantity: l.quantity, name: p.name, price: p.price }
                  : null;
              })
              .filter((l): l is GuestLine => l !== null),
          );
        })
        .finally(() => setLoading(false));
      return;
    }
    const user = getStoredUser();
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    fetchCart()
      .then((c) => {
        if (c.items.length === 0) {
          router.push("/cart");
          return;
        }
        setCart(c);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const subtotal = isGuest
    ? (guestLines ?? []).reduce((sum, l) => sum + l.price * l.quantity, 0)
    : cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) ?? 0;
  const total = subtotal - (appliedCoupon?.discountAmount ?? 0);

  async function handleApplyCoupon() {
    setCouponError("");
    setApplyingCoupon(true);
    try {
      const result = await validateCoupon(couponCode, subtotal);
      setAppliedCoupon(result);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isGuest) {
        const { order, jazzcash } = await guestCheckout({
          paymentMethod,
          couponCode: appliedCoupon?.code,
          items: (guestLines ?? []).map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
          shipping: { name, phone, address, city, state, email },
        });
        clearGuestCart();
        if (jazzcash && !jazzcash.mock) {
          redirectToJazzCash(jazzcash);
          return;
        }
        router.push(`/order-confirmation?id=${order.id}`);
        return;
      }

      const { order, jazzcash } = await checkout({
        paymentMethod,
        couponCode: appliedCoupon?.code,
        shipping: { name, phone, address, city, state },
      });
      if (jazzcash && !jazzcash.mock) {
        redirectToJazzCash(jazzcash);
        return;
      }
      router.push(`/orders?placed=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white px-4 py-8 sm:px-6">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:col-span-2">
          <h1 className="text-2xl font-extrabold">Checkout</h1>
          {isGuest && (
            <p className="-mt-2 text-xs text-zinc-500">
              Checking out as a guest.{" "}
              <a href="/login" className="font-semibold text-amber-600 hover:underline">
                Sign in
              </a>{" "}
              for faster checkout next time.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-amber-400"
            />
            <input
              required
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-amber-400"
            />
          </div>
          {isGuest && (
            <input
              required
              type="email"
              placeholder="Email Address (for order updates)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-amber-400"
            />
          )}
          <input
            required
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-amber-400"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-amber-400"
            />
            <input
              required
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-amber-400"
            />
          </div>

          <div className="mt-2">
            <div className="mb-2 text-sm font-semibold">Payment Method</div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={`flex-1 rounded-xl border p-4 text-sm font-semibold ${
                  paymentMethod === "COD" ? "border-amber-400 bg-amber-50" : "border-zinc-200"
                }`}
              >
                Cash on Delivery
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("JAZZCASH")}
                className={`flex-1 rounded-xl border p-4 text-sm font-semibold ${
                  paymentMethod === "JAZZCASH" ? "border-amber-400 bg-amber-50" : "border-zinc-200"
                }`}
              >
                Pay Online (JazzCash)
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-full bg-amber-400 px-6 py-3 font-semibold text-black hover:bg-amber-300 disabled:opacity-60"
          >
            {submitting ? "Placing order..." : `Place Order — Rs ${total.toLocaleString()}`}
          </button>
        </form>

        <div className="rounded-xl border border-zinc-200 p-5">
          <h2 className="font-bold">Order Summary</h2>
          <div className="mt-3 flex flex-col gap-3">
            {isGuest
              ? (guestLines ?? []).map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-zinc-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">Rs {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))
              : cart?.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-zinc-600">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">Rs {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
          </div>

          <div className="mt-4 flex gap-2 border-t border-zinc-200 pt-4">
            <input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs outline-none focus:border-amber-400"
            />
            <button
              type="button"
              disabled={applyingCoupon || !couponCode}
              onClick={handleApplyCoupon}
              className="shrink-0 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {applyingCoupon ? "..." : "Apply"}
            </button>
          </div>
          {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
          {appliedCoupon && (
            <p className="mt-1 text-xs text-emerald-600">
              Coupon &quot;{appliedCoupon.code}&quot; applied — Rs {appliedCoupon.discountAmount.toLocaleString()} off
            </p>
          )}

          <div className="mt-4 flex flex-col gap-1 border-t border-zinc-200 pt-3">
            <div className="flex justify-between text-sm text-zinc-600">
              <span>Subtotal</span>
              <span>Rs {subtotal.toLocaleString()}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount</span>
                <span>-Rs {appliedCoupon.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 font-bold">
              <span>Total</span>
              <span>Rs {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
