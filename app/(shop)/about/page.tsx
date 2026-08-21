import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">Our story</p>
        <h1 className="mt-1 text-3xl font-extrabold text-zinc-900">About ParasBazar</h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-600">
          ParasBazar is Pakistan&apos;s online store built around one idea: one place for everyone.
          We bring electronics, fashion, groceries and everyday essentials together so you can shop
          without jumping between a dozen different sellers.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            { title: "One store", body: "A single catalog, fair prices, and no marketplace confusion." },
            { title: "Fast delivery", body: "Orders ship across Pakistan with Cash on Delivery and JazzCash." },
            { title: "Easy returns", body: "Changed your mind? You have 7 days to send it back." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
              <h2 className="font-bold text-zinc-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.body}</p>
            </div>
          ))}
        </div>

        <Link
          href="/"
          className="mt-10 inline-flex rounded-full bg-amber-400 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-amber-300"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
}
