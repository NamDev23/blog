import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { headers } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import StructuredData from "@/components/StructuredData";
import { generateHomeMetadata } from "@/lib/metadata";
import { LanguageProvider } from "@/lib/i18n";
import { defaultLocale, isLocale } from "@/lib/locales";
import { siteConfig } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...generateHomeMetadata(),
  metadataBase: new URL(siteConfig.url),
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get("x-shadowdev-locale");
  const initialLocale = isLocale(headerLocale) ? headerLocale : defaultLocale;

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <LanguageProvider initialLocale={initialLocale}>
          <StructuredData />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
