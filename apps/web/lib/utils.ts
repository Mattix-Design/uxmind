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

export function getScoreTheme(score: number) {
  if (score >= 85) return { color: "text-green-700", bg: "bg-green-50", border: "border-green-200", dot: "bg-green-700", label: "Strong" };
  if (score >= 70) return { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-700", label: "Good" };
  if (score >= 65) return { color: "text-coral-600", bg: "bg-coral-500/10", border: "border-coral-500/20", dot: "bg-coral-600", label: "Moderate" };
  return { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-700", label: "Limited" };
}
