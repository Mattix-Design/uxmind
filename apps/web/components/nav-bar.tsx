"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/chat", label: "Chat" },
  { href: "/research", label: "Research" },
  { href: "/findings", label: "Findings" },
  { href: "/ux-laws", label: "Laws" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close when navigation occurs
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-surface-700 bg-surface-900/85 backdrop-blur-lg">
      <nav aria-label="Main navigation" className="relative mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left: Logo + nav links */}
        <div className="flex items-center gap-1">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-text-primary mr-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 18L8 10L12 14L16 6L20 12"
                stroke="#E8513D"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-lg tracking-tight">UXMind</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-coral-600"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Auth buttons (desktop) */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg border border-card-border bg-card px-4 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:outline-none"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-coral-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-coral-600 transition-colors focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Register
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden flex items-center justify-center h-9 w-9 rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        {/* Mobile dropdown */}
        {open && (
          <div className="absolute top-full left-0 right-0 bg-surface-900/95 backdrop-blur-lg border-b border-surface-700 sm:hidden">
            <div className="flex flex-col py-2 px-4">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-coral-600"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-2 border-t border-surface-700 pt-3 flex flex-col gap-2 px-3 pb-2">
                <Link
                  href="/login"
                  className="rounded-lg border border-card-border bg-card px-4 py-2 text-sm font-medium text-text-secondary text-center hover:text-text-primary transition-all"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-coral-500 px-4 py-2 text-sm font-medium text-white text-center hover:bg-coral-600 transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
