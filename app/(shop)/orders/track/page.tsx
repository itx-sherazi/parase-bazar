"use client";

import { useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlineTruck } from "react-icons/hi2";
import { trackGuestOrder, type Order } from "../../../lib/api";

const statusSteps = ["PROCESSING", "SHIPPED", "DELIVERED"] as const;

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSearched(true);
    try {
      const result = await trackGuestOrder(orderId.trim(), email.trim());
      setOrder(result);
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : "Order not found");
    } finally {
      setLoading(false);
    }
  }

  const currentStepIndex =
    order?.status === "CANCELLED" ? -1 : statusSteps.indexOf(order?.status as (typeof statusSteps)[number]);

  return (
    <div className="min-h-screen w-full bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-600">
            <HiOutlineTruck className="text-xl" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold sm:text-2xl">Track Your Order</h1>
            <p className="text-xs text-zinc-500 sm:text-sm">
              Enter your Order ID and the email you used at checkout.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            required
            placeholder="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-amber-400"
          />
          <input
            required
            type="email"
            placeholder="Email used at checkout"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-60"
          >
            <HiOutlineMagnifyingGlass /> {loading ? "Searching..." : "Track"}
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {searched && !loading && !error && order && (
          <div className="mt-8 rounded-xl border border-zinc-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">Order #{order.id.slice(-8).toUpperCase()}</div>
                <div className="text-xs text-zinc-500">
                  {new Date(order.createdAt).toLocaleDateString()} · {order.paymentMethod} · {order.paymentStatus}
                </div>
              </div>
              <span className="text-sm font-bold">Rs {order.total.toLocaleString()}</span>
            </div>

            {order.status === "CANCELLED" ? (
              <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                This order has been cancelled.
              </div>
            ) : (
              <div className="mt-6 flex items-center justify-between">
                {statusSteps.map((step, i) => (
                  <div key={step} className="flex flex-1 flex-col items-center text-center">
                    <div className="flex w-full items-center">
                      {i > 0 && (
                        <div
                          className={`h-0.5 flex-1 ${i <= currentStepIndex ? "bg-amber-400" : "bg-zinc-200"}`}
                        />
                      )}
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          i <= currentStepIndex ? "bg-amber-400 text-black" : "bg-zinc-200 text-zinc-500"
                        }`}
                      >
                        {i + 1}
                      </span>
                      {i < statusSteps.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 ${i < currentStepIndex ? "bg-amber-400" : "bg-zinc-200"}`}
                        />
                      )}
                    </div>
                    <span className="mt-2 text-[11px] font-semibold text-zinc-600 sm:text-xs">
                      {step.charAt(0) + step.slice(1).toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 border-t border-zinc-100 pt-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-zinc-600">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                    {item.itemStatus}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
              Shipping to: {order.shippingAddress}, {order.shippingCity}, {order.shippingState}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
