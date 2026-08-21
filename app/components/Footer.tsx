import Link from "next/link";
import { FaFacebookF, FaInstagram, FaYoutube, FaPinterestP } from "react-icons/fa";

const socials = [
  { Icon: FaFacebookF, label: "Facebook" },
  { Icon: FaInstagram, label: "Instagram" },
  { Icon: FaYoutube, label: "YouTube" },
  { Icon: FaPinterestP, label: "Pinterest" },
];

const customerCare = [
  { label: "Help Center", href: "#" },
  { label: "How to Buy", href: "#" },
  { label: "Returns & Refunds", href: "/legal/refund-policy" },
  { label: "Shipping & Delivery", href: "#" },
  { label: "Track Order", href: "/orders/track" },
];

const company = [
  { label: "About Us", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Refund Policy", href: "/legal/refund-policy" },
  { label: "Cookie Policy", href: "/legal/cookie-policy" },
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-zinc-200 bg-white">
      <div className="h-1 bg-gradient-to-r from-cyan-400 via-amber-400 to-fuchsia-500" />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Link href="/" className="inline-block overflow-hidden rounded-2xl shadow-sm ring-1 ring-zinc-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="ParasBazar"
              className="h-24 w-auto object-contain sm:h-28"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-600">
            Pakistan&apos;s biggest online store — shop electronics, fashion, groceries and more,
            all in one place.
          </p>
          <div className="mt-5 flex gap-2.5">
            {socials.map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 transition hover:border-amber-400 hover:bg-amber-400 hover:text-black"
              >
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>

     

        <div>
          <div className="text-sm font-bold tracking-wide text-zinc-900">Customer Care</div>
          <ul className="mt-4 space-y-2.5 text-sm text-zinc-600">
            {customerCare.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="transition hover:text-amber-500">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-sm font-bold tracking-wide text-zinc-900">Company</div>
          <ul className="mt-4 space-y-2.5 text-sm text-zinc-600">
            {company.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="transition hover:text-amber-500">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-100 bg-zinc-50">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <span className="text-sm text-zinc-500">© 2026 ParasBazar. All Rights Reserved.</span>
          <div className="flex flex-wrap gap-2">
            {["JazzCash", "Cash on Delivery", "VISA", "Mastercard"].map((p) => (
              <span
                key={p}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
