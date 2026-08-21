import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieConsent from "./components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ParasBazar — Pakistan's Online Store for Every Category.",
    template: "%s | ParasBazar",
  },
  description:
    "Pakistan's biggest online store. Shop electronics, fashion, groceries and more, all in one place.",
  openGraph: {
    type: "website",
    siteName: "ParasBazar",
    title: "ParasBazar — Pakistan's Online Store for Every Category.",
    description:
      "Pakistan's biggest online store. Shop electronics, fashion, groceries and more, all in one place.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ParasBazar — Pakistan's Online Store for Every Category.",
    description: "Pakistan's biggest online store.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-black">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
