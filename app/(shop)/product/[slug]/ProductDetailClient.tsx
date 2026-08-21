"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HiOutlineStar, HiStar, HiHeart, HiOutlineHeart, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import {
  addToCart,
  addToWishlist,
  askProductQuestion,
  fetchProducts,
  fetchProductQuestions,
  fetchProductReviews,
  fetchWishlist,
  getStoredToken,
  removeFromWishlist,
  submitReview,
  type Product,
  type ProductQuestion,
  type Review,
} from "../../../lib/api";
import { addGuestCartItem } from "../../../lib/guestCart";
import { getRecentlyViewedIds, trackRecentlyViewed } from "../../../lib/recentlyViewed";

export default function ProductDetailClient({
  product,
  initialReviews,
  initialAverageRating,
  initialReviewCount,
}: {
  product: Product;
  initialReviews: Review[];
  initialAverageRating: number;
  initialReviewCount: number;
}) {
  const router = useRouter();
  const productId = product.id;

  const [reviews, setReviews] = useState(initialReviews);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [askError, setAskError] = useState("");
  const [asking, setAsking] = useState(false);

  async function loadQuestions() {
    try {
      setQuestions(await fetchProductQuestions(productId));
    } catch {
      // non-critical
    }
  }

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!getStoredToken()) {
      router.push("/login");
      return;
    }
    setAskError("");
    setAsking(true);
    try {
      await askProductQuestion(productId, newQuestion);
      setNewQuestion("");
      await loadQuestions();
    } catch (err) {
      setAskError(err instanceof Error ? err.message : "Failed to submit question");
    } finally {
      setAsking(false);
    }
  }

  useEffect(() => {
    trackRecentlyViewed(productId);
    const ids = getRecentlyViewedIds(productId);
    if (ids.length === 0) return;
    fetchProducts()
      .then((all) => {
        const byId = new Map(all.map((p) => [p.id, p]));
        setRecentlyViewed(ids.map((id) => byId.get(id)).filter((p): p is Product => !!p).slice(0, 6));
      })
      .catch(() => {});
  }, [productId]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  const hasVariants = (product.variants?.length ?? 0) > 0;
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    hasVariants ? product.variants![0].id : undefined,
  );
  const [variantError, setVariantError] = useState("");
  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const effectivePrice = selectedVariant?.priceOverride ?? product.price;
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;

  useEffect(() => {
    if (!getStoredToken()) return;
    fetchWishlist()
      .then((items) => setIsWishlisted(items.some((i) => i.productId === productId)))
      .catch(() => {});
  }, [productId]);

  async function handleToggleWishlist() {
    if (!getStoredToken()) {
      router.push("/login");
      return;
    }
    setWishlistBusy(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(productId);
        setIsWishlisted(false);
      } else {
        await addToWishlist(productId);
        setIsWishlisted(true);
      }
    } finally {
      setWishlistBusy(false);
    }
  }

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  async function loadReviews() {
    const data = await fetchProductReviews(productId);
    setReviews(data.reviews);
    setAverageRating(data.averageRating);
    setReviewCount(data.reviewCount);
  }

  async function handleAddToCart() {
    if (hasVariants && !selectedVariantId) {
      setVariantError("Please select an option before adding to cart");
      return;
    }
    setVariantError("");
    if (!getStoredToken()) {
      addGuestCartItem(productId, 1, selectedVariantId);
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(productId, 1, selectedVariantId);
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!getStoredToken()) {
      router.push("/login");
      return;
    }
    setReviewError("");
    setSubmittingReview(true);
    try {
      await submitReview(productId, rating, comment || undefined);
      setComment("");
      await loadReviews();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-white px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-xl bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[0] || "https://picsum.photos/seed/" + product.id + "/600/600"}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{product.name}</h1>
            <div className="mt-1 flex items-center gap-1 text-sm text-amber-500">
              <HiStar /> {averageRating.toFixed(1)}{" "}
              <span className="text-zinc-500">({reviewCount} reviews)</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold">Rs {effectivePrice.toLocaleString()}</span>
              {product.mrp && <span className="text-zinc-400 line-through">Rs {product.mrp.toLocaleString()}</span>}
            </div>
            {product.description && <p className="mt-4 text-sm text-zinc-600">{product.description}</p>}

            {hasVariants && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-zinc-700">Select an option</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.variants!.map((v) => {
                    const label = [v.size, v.color].filter(Boolean).join(" / ") || v.sku || "Option";
                    const outOfStock = v.stock === 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={outOfStock}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                          selectedVariantId === v.id
                            ? "border-amber-400 bg-amber-50 text-amber-700"
                            : "border-zinc-300 text-zinc-600 hover:border-amber-400"
                        }`}
                      >
                        {label} {outOfStock && "(out of stock)"}
                      </button>
                    );
                  })}
                </div>
                {variantError && <p className="mt-1 text-xs text-red-600">{variantError}</p>}
              </div>
            )}

            <div className="mt-2 text-xs text-zinc-500">
              {effectiveStock > 0 ? `${effectiveStock} in stock` : "Out of stock"}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                disabled={addingToCart || effectiveStock === 0}
                onClick={handleAddToCart}
                className="flex-1 rounded-full bg-amber-400 py-3 font-semibold text-black hover:bg-amber-300 disabled:opacity-60"
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button
                disabled={wishlistBusy}
                onClick={handleToggleWishlist}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border text-xl disabled:opacity-60 ${
                  isWishlisted
                    ? "border-amber-400 bg-amber-50 text-amber-500"
                    : "border-zinc-300 text-zinc-500 hover:border-amber-400 hover:text-amber-500"
                }`}
              >
                {isWishlisted ? <HiHeart /> : <HiOutlineHeart />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold">Customer Reviews</h2>

          <form onSubmit={handleSubmitReview} className="mt-4 flex flex-col gap-3 rounded-xl border border-zinc-200 p-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setRating(i + 1)}>
                  {i < rating ? (
                    <HiStar className="text-xl text-amber-400" />
                  ) : (
                    <HiOutlineStar className="text-xl text-zinc-300" />
                  )}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Share your experience (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-amber-400"
            />
            {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
            <button
              type="submit"
              disabled={submittingReview}
              className="self-start rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-zinc-500">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="border-b border-zinc-100 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{r.user.name}</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) =>
                      i < r.rating ? (
                        <HiStar key={i} className="text-sm" />
                      ) : (
                        <HiOutlineStar key={i} className="text-sm text-zinc-300" />
                      ),
                    )}
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-zinc-700">{r.comment}</p>}
                  {r.adminReply && (
                    <div className="mt-2 rounded-lg bg-zinc-50 p-3 text-sm">
                      <span className="font-semibold">ParasBazar reply: </span>
                      {r.adminReply}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <HiOutlineChatBubbleLeftRight /> Questions &amp; Answers
          </h2>

          <form onSubmit={handleAskQuestion} className="mt-4 flex flex-col gap-3 rounded-xl border border-zinc-200 p-4">
            <textarea
              required
              minLength={5}
              placeholder="Ask a question about this product..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
            />
            {askError && <p className="text-sm text-red-600">{askError}</p>}
            <button
              type="submit"
              disabled={asking}
              className="self-start rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-60"
            >
              {asking ? "Submitting..." : "Ask Question"}
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-3">
            {questions.length === 0 ? (
              <p className="text-sm text-zinc-500">No questions yet. Be the first to ask!</p>
            ) : (
              questions.map((q) => (
                <div key={q.id} className="rounded-xl border border-zinc-200 p-4">
                  <div className="text-sm font-semibold text-zinc-800">Q: {q.question}</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Asked by {q.user.name} · {new Date(q.createdAt).toLocaleDateString()}
                  </div>
                  {q.answer ? (
                    <div className="mt-2 rounded-lg bg-zinc-50 p-3 text-sm">
                      <span className="font-semibold">Seller answer: </span>
                      {q.answer}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-amber-600">Awaiting seller's answer</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {recentlyViewed.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold">Recently Viewed</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {recentlyViewed.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
                >
                  <div className="relative aspect-square bg-zinc-100">
                    {p.images[0] ? (
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-xs text-zinc-400">No image</div>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="line-clamp-2 text-[11px] font-semibold text-zinc-800">{p.name}</div>
                    <div className="mt-1 text-xs font-bold">Rs {p.price.toLocaleString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
