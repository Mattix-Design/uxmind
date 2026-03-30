import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: "UXMind.ai — Still designing for humans",
  description:
    "AI-powered UX research knowledge base. Ask questions about evidence-based UX, browse vetted research, and explore UX laws.",
  openGraph: {
    title: "UXMind.ai — Still designing for humans",
    description:
      "AI-powered UX research knowledge base. Ask questions about evidence-based UX, browse vetted research, and explore UX laws.",
    images: [
      {
        url: "/api/og?title=Evidence-based%20UX%20Research&type=UXMind.ai",
        width: 1200,
        height: 630,
        alt: "UXMind.ai — Evidence-based UX Research",
      },
    ],
    siteName: "UXMind.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UXMind.ai — Still designing for humans",
    description:
      "AI-powered UX research knowledge base. Ask questions about evidence-based UX, browse vetted research, and explore UX laws.",
    images: ["/api/og?title=Evidence-based%20UX%20Research&type=UXMind.ai"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-coral-500 focus:px-4 focus:py-2 focus:text-white focus:text-sm">
          Skip to content
        </a>
        <NavBar />
        <main id="main-content" className="flex-1">{children}</main>
      </body>
    </html>
  );
}
