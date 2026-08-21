import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProduct, fetchProductReviews } from "../../../lib/api";
import ProductDetailClient from "./ProductDetailClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getProductSafe(slug: string) {
  try {
    return await fetchProduct(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductSafe(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const image = product.images[0];

  return {
    title: product.name,
    description: product.description || `Buy ${product.name} on ParasBazar — ₹${product.price}`,
    alternates: { canonical: `${SITE_URL}/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} on ParasBazar`,
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductSafe(slug);

  if (!product) {
    notFound();
  }

  const { reviews, averageRating, reviewCount } = await fetchProductReviews(product.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.images[0] ? [product.images[0]] : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/product/${product.slug}`,
    },
    ...(reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating,
            reviewCount,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        initialReviews={reviews}
        initialAverageRating={averageRating}
        initialReviewCount={reviewCount}
      />
    </>
  );
}
