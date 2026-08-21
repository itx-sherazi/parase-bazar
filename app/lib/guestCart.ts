"use client";

const GUEST_CART_KEY = "ParasBazar_guest_cart";

export interface GuestCartLine {
  productId: string;
  variantId?: string;
  quantity: number;
}

function read(): GuestCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as GuestCartLine[]) : [];
  } catch {
    return [];
  }
}

function write(lines: GuestCartLine[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("guest-cart-updated"));
}

function matches(line: GuestCartLine, productId: string, variantId?: string) {
  return line.productId === productId && (line.variantId || undefined) === (variantId || undefined);
}

export function getGuestCart(): GuestCartLine[] {
  return read();
}

export function getGuestCartCount(): number {
  return read().reduce((sum, l) => sum + l.quantity, 0);
}

export function addGuestCartItem(productId: string, quantity = 1, variantId?: string) {
  const lines = read();
  const existing = lines.find((l) => matches(l, productId, variantId));
  if (existing) {
    existing.quantity += quantity;
  } else {
    lines.push({ productId, variantId, quantity });
  }
  write(lines);
}

export function updateGuestCartItem(productId: string, quantity: number, variantId?: string) {
  const lines = read()
    .map((l) => (matches(l, productId, variantId) ? { ...l, quantity } : l))
    .filter((l) => l.quantity > 0);
  write(lines);
}

export function removeGuestCartItem(productId: string, variantId?: string) {
  write(read().filter((l) => !matches(l, productId, variantId)));
}

export function clearGuestCart() {
  write([]);
}
