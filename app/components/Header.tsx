"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HiOutlineUser, HiOutlineHeart, HiOutlineShoppingBag } from "react-icons/hi2";
import { getStoredUser, fetchCart, fetchWishlist, getStoredToken, type AuthUser } from "../lib/api";
import { getGuestCartCount } from "../lib/guestCart";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/orders/track", label: "Track Order" },
];

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    setUser(getStoredUser());
    if (getStoredToken()) {
      fetchCart()
        .then((cart) => setCartCount(cart.items.reduce((sum, i) => sum + i.quantity, 0)))
        .catch(() => setCartCount(0));
      fetchWishlist()
        .then((items) => setWishlistCount(items.length))
        .catch(() => setWishlistCount(0));
    } else {
      setCartCount(getGuestCartCount());
      const onGuestCartUpdate = () => setCartCount(getGuestCartCount());
      window.addEventListener("guest-cart-updated", onGuestCartUpdate);
      return () => window.removeEventListener("guest-cart-updated", onGuestCartUpdate);
    }
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="border-b border-zinc-100 bg-white px-4 py-1.5 text-black sm:px-6 sm:py-2">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex shrink-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ParasBazar" className="h-12 w-auto object-contain sm:h-14" />
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-3 sm:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap text-[11px] font-semibold transition sm:text-sm ${
                isActive(item.href) ? "text-amber-500" : "text-zinc-700 hover:text-amber-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3 text-xs font-medium text-zinc-700 sm:gap-6">
          <Link href={user ? "/orders" : "/login"} className="flex flex-col items-center gap-0.5">
            <HiOutlineUser className="text-xl" />
            <span className="hidden sm:inline">{user ? user.name.split(" ")[0] : "Sign In / Register"}</span>
          </Link>
          <Link href={user ? "/wishlist" : "/login"} className="relative flex flex-col items-center gap-0.5">
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-1 grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-[9px] font-bold text-black">
                {wishlistCount}
              </span>
            )}
            <HiOutlineHeart className="text-xl" />
            <span className="hidden sm:inline">Wishlist</span>
          </Link>
          <Link href="/cart" className="relative flex flex-col items-center gap-0.5">
            <span className="absolute -right-2 -top-1 grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-[9px] font-bold text-black">
              {cartCount}
            </span>
            <HiOutlineShoppingBag className="text-xl" />
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
