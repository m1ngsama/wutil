import type { Metadata, Viewport } from "next";
import { Abril_Fatface, Mulish, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "next-themes";
import { AppToaster } from "@/components/AppToaster";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { createPageMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

const abrilFatface = Abril_Fatface({
  weight: "400",
  variable: "--font-abril",
  subsets: ["latin"],
  display: "swap",
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "wutil - Free Online Web Tools",
    description: "A collection of free, lightweight, privacy-focused client-side web tools. PDF Merger, Image Converter, Word Counter, JSON Formatter, and more.",
    path: "",
  }),
  title: {
    default: "wutil - Free Online Web Tools",
    template: "%s | wutil",
  },
  applicationName: SITE_NAME,
  category: "utilities",
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icon-192.png", type: "image/png", sizes: "192x192" }],
  },
  appleWebApp: {
    capable: true,
    title: "wutil",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#11100f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${abrilFatface.variable} ${mulish.variable} ${geistMono.variable} antialiased flex min-h-dvh flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <a
            href="#main-content"
            className="sr-only z-[60] rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-[var(--w-ring)] focus:ring-offset-2 focus:ring-offset-canvas"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main-content" tabIndex={-1} className="flex-grow bg-canvas focus:outline-none">
            {children}
          </main>
          <Footer />
          <AppToaster />
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}
