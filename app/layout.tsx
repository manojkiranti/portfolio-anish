import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#070b16" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  title: {
    default: `${siteConfig.name} — ${siteConfig.title}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: `Portfolio of ${siteConfig.name}, a ${siteConfig.title} with 4+ years assessing residential and investment lending applications for Australian mortgage broker ODIN Mortgage. Based across ${siteConfig.locationShort}.`,
  keywords: [
    siteConfig.name,
    "Credit Analyst",
    "Credit Analyst Australia",
    "Mortgage Broker Australia",
    "ODIN Mortgage",
    "Loan Serviceability Analyst",
    "Lending Compliance",
    "Nepal",
    "Australia",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.baseUrl }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: siteConfig.baseUrl,
    title: `${siteConfig.name} — ${siteConfig.title}`,
    description: siteConfig.tagline,
    siteName: `${siteConfig.name} Portfolio`,
    images: [
      {
        url: "/og-image.jpg", // TODO: add this image to /public
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.title}`,
    description: siteConfig.tagline,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteConfig.baseUrl,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <JsonLd />
        </ThemeProvider>
      </body>
    </html>
  );
}
