"use client";

import { useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; "error-callback"?: () => void },
      ) => string;
    };
  }
}

// Renders nothing until the backend reports CAPTCHA is enabled (TURNSTILE_SECRET_KEY set).
// This keeps auth forms fully functional with zero setup, and CAPTCHA turns on the moment
// real keys are added to backend/.env — no frontend changes needed.
export default function Captcha({ onVerify }: { onVerify: (token: string | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/captcha-config`)
      .then((res) => res.json())
      .then((data) => {
        if (data.enabled && data.siteKey) setSiteKey(data.siteKey);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!siteKey) return;

    function render() {
      if (window.turnstile && containerRef.current) {
        window.turnstile.render(containerRef.current, {
          sitekey: siteKey!,
          callback: (token: string) => onVerify(token),
          "error-callback": () => onVerify(null),
        });
      }
    }

    if (window.turnstile) {
      render();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.onload = render;
    document.body.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null;

  return <div ref={containerRef} className="my-1" />;
}
