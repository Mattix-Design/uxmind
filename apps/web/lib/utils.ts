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
  if (score >= 85) return { color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", dot: "bg-emerald-400", label: "Strong" };
  if (score >= 70) return { color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30", dot: "bg-amber-400", label: "Good" };
  if (score >= 65) return { color: "text-coral-400", bg: "bg-coral-500/15", border: "border-coral-500/30", dot: "bg-coral-400", label: "Moderate" };
  return { color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30", dot: "bg-red-400", label: "Limited" };
}
