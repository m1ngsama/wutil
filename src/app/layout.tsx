import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wutil.pages.dev",
    siteName: "wutil",
    title: "wutil - Free Online Web Tools",
    description: "Fast, free, and private web tools running entirely in your browser.",
    images: [
      {
        url: "/og-image.png", // We should create this later
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
  metadataBase: new URL("https://wutil.pages.dev"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="flex-grow bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
