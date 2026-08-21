"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "ParasBazar_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white px-4 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-zinc-600 sm:text-sm">
          We use cookies to keep you signed in, remember your cart, and improve your shopping experience. By using
          ParasBazar, you agree to our{" "}
          <Link href="/legal/cookie-policy" className="font-semibold text-amber-600 hover:underline">
            Cookie Policy
          </Link>
          .
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-black hover:bg-amber-300"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
