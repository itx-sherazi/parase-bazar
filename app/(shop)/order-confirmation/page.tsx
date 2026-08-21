"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HiOutlineCheckCircle } from "react-icons/hi2";

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-4xl text-emerald-500">
        <HiOutlineCheckCircle />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold text-zinc-900">Order Placed!</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Thanks for shopping with ParasBazar. We&apos;ve emailed your order confirmation.
        {orderId && (
          <>
            {" "}Order ID: <span className="font-mono font-semibold text-zinc-700">{orderId}</span>
          </>
        )}
      </p>
      <p className="mt-2 max-w-sm text-xs text-zinc-400">
        Create an account to track this order and future purchases from one place.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/signup" className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-black hover:bg-amber-300">
          Create Account
        </Link>
        <Link href="/" className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
