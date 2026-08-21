"use client";

const KEY = "ParasBazar_recently_viewed";
const MAX_ITEMS = 10;

export function trackRecentlyViewed(productId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    const next = [productId, ...ids.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors (private browsing, quota, etc.)
  }
}

export function getRecentlyViewedIds(excludeId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    return excludeId ? ids.filter((id) => id !== excludeId) : ids;
  } catch {
    return [];
  }
}
