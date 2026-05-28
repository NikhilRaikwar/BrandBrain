import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import type { ReactNode } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BrandBrain",
    template: "%s | BrandBrain",
  },
  description: "Living Company Brain for marketing agencies. Ingest campaigns, query brand knowledge, and score copy using Ogilvy-style judgment.",
  keywords: [
    "BrandBrain",
    "company brain",
    "marketing agency AI",
    "knowledge base",
    "Ogilvy copy reviewer",
    "Supabase",
    "Next.js 14",
    "OpenAI",
    "brand knowledge",
    "agency ops",
  ],
  authors: [{ name: "BrandBrain" }],
  creator: "BrandBrain",
  publisher: "BrandBrain",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BrandBrain",
    description:
      "Living Company Brain for marketing agencies. Ingest campaigns, query brand knowledge, and score copy using Ogilvy-style judgment.",
    url: siteUrl,
    siteName: "BrandBrain",
    type: "website",
    images: [
      {
        url: "/brandbrainbanner.png",
        width: 1200,
        height: 630,
        alt: "BrandBrain banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandBrain",
    description:
      "Living Company Brain for marketing agencies. Ingest campaigns, query brand knowledge, and score copy using Ogilvy-style judgment.",
    images: ["/brandbrainbanner.png"],
  },
  icons: {
    icon: "/brandbrainlogo.png",
    shortcut: "/brandbrainlogo.png",
    apple: "/brandbrainlogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body>
        {children}
        <Toaster richColors closeButton position="top-right" />
        <Analytics />
      </body>
    </html>
  );
}
