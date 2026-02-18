import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GeoWatch — See How AI Sees Your Brand",
  description:
    "Track your brand's visibility in ChatGPT, Perplexity, Google AI Overviews, and every major AI Answer Engine. Monitor, optimize, and dominate AI search results.",
  keywords: [
    "GEO",
    "generative engine optimization",
    "AEO",
    "answer engine optimization",
    "AI visibility",
    "AI search ranking",
    "ChatGPT brand tracking",
    "Perplexity monitoring",
  ],
  openGraph: {
    title: "GeoWatch — See How AI Sees Your Brand",
    description:
      "Track your brand's visibility across all major AI Answer Engines. Monitor citations, analyze competitors, and optimize your AI search presence.",
    url: "https://geowatch.ai",
    siteName: "GeoWatch",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GeoWatch - AI Visibility Tracking",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GeoWatch — See How AI Sees Your Brand",
    description:
      "Track your brand's visibility across all major AI Answer Engines.",
  },
  metadataBase: new URL("https://geowatch.ai"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050508] text-[#f0f0f5]`}
      >
        {children}
      </body>
    </html>
  );
}
