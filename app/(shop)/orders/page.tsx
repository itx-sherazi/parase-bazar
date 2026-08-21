"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { HiOutlineCheckCircle, HiOutlineArrowDownTray } from "react-icons/hi2";
import {
  downloadInvoice,
  fetchMyOrders,
  fetchMyReturns,
  getStoredToken,
  requestReturn,
  type Order,
  type ReturnRequest,
} from "../../lib/api";

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const placedId = searchParams.get("placed");
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownloadInvoice(orderId: string) {
    setDownloadingId(orderId);
    try {
      await downloadInvoice(orderId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to download invoice");
    } finally {
      setDownloadingId(null);
    }
  }

  async function load() {
    const [ordersData, returnsData] = await Promise.all([fetchMyOrders(), fetchMyReturns()]);
    setOrders(ordersData);
    setReturns(returnsData);
  }

  useEffect(() => {
    if (!getStoredToken()) {
      router.push("/login");
      return;
    }
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function returnFor(itemId: string) {
    return returns.find((r) => r.orderItemId === itemId);
  }

  async function handleRequestReturn(itemId: string) {
    const reason = window.prompt("Why are you returning this item?");
    if (!reason) return;
    setRequestingId(itemId);
    try {
      await requestReturn(itemId, reason);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to request return");
    } finally {
      setRequestingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white">
        <p className="text-sm text-zinc-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-extrabold">My Orders</h1>

        {placedId && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <HiOutlineCheckCircle className="text-xl" /> Order placed successfully!
          </div>
        )}

        {orders.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">You have no orders yet.</p>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-zinc-200 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">Order #{order.id.slice(-8).toUpperCase()}</div>
                    <div className="text-xs text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.paymentMethod} ·{" "}
                      {order.paymentStatus}
                    </div>
                    <span className="mt-1 inline-block rounded-full bg-zinc-900 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">Rs {order.total.toLocaleString()}</span>
                    <button
                      disabled={downloadingId === order.id}
                      onClick={() => handleDownloadInvoice(order.id)}
                      className="flex items-center gap-1 rounded-full border border-zinc-300 px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:border-black hover:text-black disabled:opacity-50"
                    >
                      <HiOutlineArrowDownTray />
                      {downloadingId === order.id ? "..." : "Invoice"}
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2 border-t border-zinc-100 pt-3">
                  {order.items.map((item) => {
                    const existingReturn = returnFor(item.id);
                    return (
                      <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="text-zinc-600">
                          {item.product.name} × {item.quantity}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                            {item.itemStatus}
                          </span>
                          {item.itemStatus === "DELIVERED" && !existingReturn && (
                            <button
                              disabled={requestingId === item.id}
                              onClick={() => handleRequestReturn(item.id)}
                              className="rounded-full border border-zinc-300 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 hover:border-black hover:text-black disabled:opacity-50"
                            >
                              Request Return
                            </button>
                          )}
                          {existingReturn && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                              Return {existingReturn.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
