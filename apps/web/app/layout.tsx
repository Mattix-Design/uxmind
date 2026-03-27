import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: "UXMind.ai — Still designing for humans",
  description:
    "AI-powered UX research knowledge base. Ask questions about evidence-based UX, browse vetted research, and explore UX laws.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
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
