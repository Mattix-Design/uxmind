import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null): string {
  if (!date) return "Unknown";
  return new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
  });
}

export function researchTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    user_testing: "User Testing",
    analytics_based: "Analytics",
    survey: "Survey",
    academic: "Academic",
    mixed_methods: "Mixed Methods",
  };
  return labels[type] || type;
}

export function siteContextLabel(context: string): string {
  return context
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * @deprecated Use `getScoreTheme` from `@/lib/design-system` instead.
 * Kept for backward compatibility — delegates to the design system.
 */
export { getScoreTheme } from "./design-system";
