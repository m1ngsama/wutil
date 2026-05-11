import type { Metadata } from "next";
import { Abril_Fatface, Mulish, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
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
});

export const metadata: Metadata = {
  title: {
    default: "wutil - Free Online Web Tools",
    template: "%s | wutil",
  },
  description: "A collection of free, lightweight, privacy-focused client-side web tools. PDF Merger, Image Converter, Word Counter, JSON Formatter, and more.",
  keywords: ["web tools", "online tools", "pdf merger", "image converter", "word counter", "json formatter", "client-side", "privacy"],
  authors: [{ name: "wutil" }],
  creator: "wutil",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "wutil - Free Online Web Tools",
    description: "Fast, free, and private web tools running entirely in your browser.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "wutil - Web Utilities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "wutil - Free Online Web Tools",
    description: "Fast, free, and private web tools running entirely in your browser.",
    creator: "@wutil",
  },
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${abrilFatface.variable} ${mulish.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-grow bg-canvas">
            {children}
          </main>
          <Footer />
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
