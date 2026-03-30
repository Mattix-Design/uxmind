"use client";

import { useState } from "react";

interface SourceLinkProps {
  url: string;
  title: string;
}

/**
 * SourceLink — renders a "View source" link with a fallback.
 *
 * If the user clicks the link and the external page can't load,
 * shows a helpful fallback with a Google Scholar search for the article title.
 */
export function SourceLink({ url, title }: SourceLinkProps) {
  const [showFallback, setShowFallback] = useState(false);

  const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`;

  function handleClick() {
    // Open the source URL in a new tab
    const newTab = window.open(url, "_blank", "noopener,noreferrer");

    // If pop-up was blocked, just let the browser handle the default <a> behaviour
    if (!newTab) return;

    // Show the fallback after a short delay so the user can see it if they come back
    setTimeout(() => setShowFallback(true), 500);
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="inline-flex items-center gap-1 font-medium text-coral-500 hover:text-coral-700 transition-colors"
      >
        View source
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H21m0 0v7.5m0-7.5l-9 9"
          />
        </svg>
      </a>
      {showFallback && (
        <a
          href={scholarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-coral-500 transition-colors"
          title="Search for this article on Google Scholar"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          Search Scholar
        </a>
      )}
    </span>
  );
}
