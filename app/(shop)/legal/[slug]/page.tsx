import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchLegalPage } from "../../../lib/api";

async function getPageSafe(slug: string) {
  try {
    return await fetchLegalPage(slug);
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
  const page = await getPageSafe(slug);
  return { title: page?.title || "Page Not Found" };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageSafe(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full bg-white px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-extrabold">{page.title}</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Last updated {new Date(page.updatedAt).toLocaleDateString()}
        </p>
        <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
          {page.content}
        </div>
      </div>
    </div>
  );
}
