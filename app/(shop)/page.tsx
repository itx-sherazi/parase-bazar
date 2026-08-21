"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchProducts, addToCart, getStoredToken, type Product } from "../lib/api";
import { addGuestCartItem } from "../lib/guestCart";
import {
  HiOutlineHeart,
  HiOutlineTag,
  HiOutlineTruck,
  HiArrowRight,
  HiStar,
  HiOutlineLockClosed,
  HiOutlineArrowUturnLeft,
  HiOutlineLifebuoy,
  HiOutlineSquares2X2,
  HiOutlineDevicePhoneMobile,
} from "react-icons/hi2";
import { FaTshirt, FaChild, FaCouch, FaGem } from "react-icons/fa";
import { MdOutlineFace3 } from "react-icons/md";

const categories = [
  { name: "Women", sub: "Fashion", icon: <FaTshirt />, bg: "bg-pink-500" },
  { name: "Men", sub: "Fashion", icon: <FaTshirt />, bg: "bg-blue-500" },
  { name: "Kids", sub: "Fashion", icon: <FaChild />, bg: "bg-yellow-500" },
  { name: "Home & Living", sub: "Essentials", icon: <FaCouch />, bg: "bg-teal-500" },
  { name: "Beauty", sub: "Care", icon: <MdOutlineFace3 />, bg: "bg-purple-500" },
  { name: "Jewellery", sub: "Accessories", icon: <FaGem />, bg: "bg-orange-500" },
  { name: "Electronics", sub: "Devices", icon: <HiOutlineDevicePhoneMobile />, bg: "bg-rose-500" },
  { name: "View All", sub: "Categories", icon: <HiOutlineSquares2X2 />, bg: "bg-amber-400" },
];

const placeholderProducts = [
  { id: "ph-1", name: "Embroidered Anarkali Suit Set", categoryName: "Women's Clothing", price: 1299, mrp: 2599, images: ["https://picsum.photos/seed/ParasBazar-1/400/560"] },
  { id: "ph-2", name: "Floral Printed Kurta Set", categoryName: "Women's Clothing", price: 899, mrp: 1799, images: ["https://picsum.photos/seed/ParasBazar-2/400/560"] },
  { id: "ph-3", name: "Designer Lehenga Choli Set", categoryName: "Women's Clothing", price: 2499, mrp: 4999, images: ["https://picsum.photos/seed/ParasBazar-3/400/560"] },
  { id: "ph-4", name: "Silk Blend Saree With Blouse", categoryName: "Women's Clothing", price: 999, mrp: 1999, images: ["https://picsum.photos/seed/ParasBazar-4/400/560"] },
  { id: "ph-5", name: "Cotton Straight Kurta Set", categoryName: "Women's Clothing", price: 649, mrp: 1299, images: ["https://picsum.photos/seed/ParasBazar-5/400/560"] },
  { id: "ph-6", name: "Embroidered Kurta Palazzo Set", categoryName: "Women's Clothing", price: 799, mrp: 1599, images: ["https://picsum.photos/seed/ParasBazar-6/400/560"] },
];

const heroFeatures = [
  { icon: <HiOutlineSquares2X2 />, title: "Every Category", sub: "One Store", bg: "bg-pink-500" },
  { icon: <HiOutlineTag />, title: "Great Prices", sub: "Best Deals", bg: "bg-orange-500" },
  { icon: <HiOutlineTruck />, title: "Fast Delivery", sub: "Across Pakistan", bg: "bg-purple-500" },
];

const trustFeatures = [
  { icon: <HiOutlineLockClosed />, title: "100% Secure", sub: "Payments" },
  { icon: <HiOutlineArrowUturnLeft />, title: "7 Days", sub: "Easy Returns" },
  { icon: <HiOutlineTruck />, title: "Fast Delivery", sub: "Across Pakistan" },
  { icon: <HiOutlineTag />, title: "Best Prices", sub: "Everyday" },
  { icon: <HiOutlineLifebuoy />, title: "24x7 Customer", sub: "Support" },
];

export default function Home() {
  const [liveProducts, setLiveProducts] = useState<Product[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setLiveProducts)
      .catch(() => setLiveProducts(null));
  }, []);

  const allProducts =
    liveProducts && liveProducts.length > 0
      ? liveProducts.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          categoryName: p.category?.name ?? "Uncategorized",
          price: p.price,
          mrp: p.mrp,
          images: p.images.length > 0 ? p.images : ["https://picsum.photos/seed/" + p.id + "/400/560"],
        }))
      : placeholderProducts.map((p) => ({ ...p, slug: p.id }));

  const productCategories = Array.from(new Set(allProducts.map((p) => p.categoryName)));
  const displayProducts = activeCategory
    ? allProducts.filter((p) => p.categoryName === activeCategory)
    : allProducts;

  async function handleAddToCart(productId: string) {
    if (!getStoredToken()) {
      addGuestCartItem(productId, 1);
      return;
    }
    setAddingId(productId);
    try {
      await addToCart(productId, 1);
    } finally {
      setAddingId(null);
    }
  }

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ParasBazar",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/logo.png`,
    sameAs: [],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ParasBazar",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  };

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-white text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      {/* Hero banner */}
      <section className="relative w-full overflow-hidden bg-amber-50">
        <div className="grid w-full grid-cols-1 items-stretch gap-8 md:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-8 sm:px-10 md:pl-16 md:pr-8 md:py-10">
            <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl lg:text-5xl">
              Pakistan&apos;s <span className="text-amber-500">Biggest</span>
              <br />
              Online Store.
            </h1>
            <p className="mt-4 max-w-md text-sm text-zinc-600 sm:text-base">
              Shop electronics, fashion, groceries and more — every category,
              all in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-300 sm:text-base">
                SHOP NOW
              </button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {heroFeatures.map((f) => (
                <div key={f.title} className="flex items-center gap-2">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white ${f.bg}`}>
                    {f.icon}
                  </span>
                  <div className="text-xs">
                    <div className="font-semibold">{f.title}</div>
                    <div className="text-zinc-500">{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-56 sm:h-64 md:h-auto md:min-h-[320px]">
            <Image
              src="/her-right-transperent.png"
              alt="ParasBazar featured collection"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain object-bottom md:object-left"
            />
          </div>
        </div>
      </section>

      {/* Category icons */}
      <section className="w-full bg-white px-4 py-8 shadow-sm">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-4 gap-4 sm:grid-cols-4 md:grid-cols-8">
          {categories.map((cat) => (
            <div key={cat.name} className="flex flex-col items-center gap-2 text-center">
              <span className={`grid h-12 w-12 place-items-center rounded-full text-xl text-white sm:h-14 sm:w-14 sm:text-2xl ${cat.bg}`}>
                {cat.icon}
              </span>
              <div className="text-[11px] font-semibold sm:text-xs">{cat.name}</div>
              <div className="hidden text-[10px] text-zinc-500 sm:block">{cat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Promo cards */}
      <section className="mx-auto mt-8 grid w-full max-w-6xl grid-cols-1 gap-5 px-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-pink-100 p-6">
          <div className="text-xs font-semibold uppercase text-pink-600">Summer</div>
          <div className="mt-1 text-2xl font-extrabold">Specials</div>
          <div className="mt-1 text-sm text-zinc-600">Up to 60% OFF</div>
          <button className="mt-4 rounded-full bg-pink-600 px-5 py-2 text-sm font-semibold text-white">
            SHOP NOW
          </button>
        </div>
        <div className="rounded-2xl bg-emerald-100 p-6">
          <div className="text-xs font-semibold uppercase text-emerald-600">New Arrivals</div>
          <div className="mt-1 text-2xl font-extrabold">Fresh Styles</div>
          <div className="mt-1 text-sm text-zinc-600">Just For You</div>
          <button className="mt-4 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">
            EXPLORE
          </button>
        </div>
      </section>

      {/* Trending Now */}
      <section className="mx-auto mt-10 w-full max-w-6xl px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold sm:text-2xl">Trending Now</h2>
          <span className="flex items-center gap-1 text-sm font-semibold text-zinc-600">
            View All <HiArrowRight />
          </span>
        </div>

        {productCategories.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeCategory === null ? "bg-amber-400 text-black" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              All
            </button>
            {productCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  activeCategory === cat ? "bg-amber-400 text-black" : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
          {displayProducts.map((p) => {
            const isReal = !p.id.startsWith("ph-");
            const CardInner = (
              <>
                <div className="relative aspect-square bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                  <button
                    aria-label="Add to wishlist"
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90"
                  >
                    <HiOutlineHeart className="text-sm" />
                  </button>
                </div>
                <div className="p-3">
                  <div className="line-clamp-2 text-xs font-medium text-zinc-800">{p.name}</div>
                  <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                    <span className="text-sm font-bold">Rs {p.price.toLocaleString()}</span>
                    {p.mrp && (
                      <>
                        <span className="text-xs text-zinc-400 line-through">Rs {p.mrp.toLocaleString()}</span>
                        <span className="text-xs font-semibold text-emerald-600">
                          {Math.round((1 - p.price / p.mrp) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500">
                    <HiStar className="text-amber-400" /> 4.5
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-600">Free Delivery</div>
                </div>
              </>
            );

            return (
              <div key={p.id} className="overflow-hidden rounded-xl border border-zinc-100 shadow-sm">
                {isReal ? <Link href={`/product/${p.slug}`}>{CardInner}</Link> : CardInner}
                <div className="px-3 pb-3">
                  <button
                    disabled={addingId === p.id}
                    onClick={() => handleAddToCart(p.id)}
                    className="w-full rounded-full bg-black py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
                  >
                    {addingId === p.id ? "Adding..." : "Add to Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features row */}
      <section className="mx-auto mt-10 grid w-full max-w-6xl grid-cols-2 gap-6 border-t border-zinc-100 px-4 py-8 text-center text-sm sm:grid-cols-5">
        {trustFeatures.map((f) => (
          <div key={f.title} className="flex flex-col items-center gap-1">
            <span className="text-2xl text-amber-500">{f.icon}</span>
            <div className="font-semibold">{f.title}</div>
            <div className="text-zinc-500">{f.sub}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
