import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import {
  cn,
  formatDate,
  researchTypeLabel,
  siteContextLabel,
} from "@/lib/utils";
import { CopyButton, ShareButton } from "@/components/copy-button";
import { BackLink } from "@/components/back-link";
import { SourceLink } from "@/components/source-link";

export const revalidate = 3600;

interface ResearchEntry {
  id: string;
  title: string;
  slug: string;
  attributed_summary: string | null;
  source_name: string | null;
  source_url: string | null;
  authors: string[] | null;
  published_date: string | null;
  publication_date: string | null;
  research_type: string;
  key_findings: string[] | null;
  methodology_summary: string | null;
  sample_size: number | null;
  limitations: string[] | null;
  tags: string[] | null;
  site_contexts: string[] | null;
  quality_score: number | null;
  impact_score: number | null;
  status: string;
}

type PageProps = { params: Promise<{ slug: string }> };

async function getEntry(slug: string): Promise<ResearchEntry | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("research_entries")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry) return { title: "Not Found" };
  const ogTitle = entry.title;
  const ogType = entry.research_type
    ? entry.research_type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
    : "Research";
  return {
    title: `${entry.title} — UXMind.ai`,
    description:
      entry.attributed_summary?.slice(0, 160) ??
      `UX research: ${entry.title}`,
    openGraph: {
      title: `${entry.title} — UXMind.ai`,
      description:
        entry.attributed_summary?.slice(0, 160) ??
        `UX research: ${entry.title}`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(ogTitle)}&type=${encodeURIComponent(ogType)}`,
          width: 1200,
          height: 630,
          alt: entry.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${entry.title} — UXMind.ai`,
      images: [`/api/og?title=${encodeURIComponent(ogTitle)}&type=${encodeURIComponent(ogType)}`],
    },
  };
}

export default async function ResearchDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-sm text-text-muted">
        <Link href="/research" className="hover:text-coral-500 transition-colors">
          Research
        </Link>
        <span className="text-surface-700">/</span>
        <span className="truncate text-text-secondary">{entry.title}</span>
      </nav>

      {/* Title and metadata */}
      <header>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-text-primary">
          {entry.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
          {entry.source_name && <span>{entry.source_name}</span>}

          {entry.authors && entry.authors.length > 0 && (
            <span>{entry.authors.join(", ")}</span>
          )}

          {(entry.publication_date || entry.published_date) && (
            <span>{formatDate(entry.publication_date || entry.published_date)}</span>
          )}

          {entry.source_url && (
            <SourceLink url={entry.source_url} title={entry.title} />
          )}
        </div>

        {/* Research type pill + Evidence Score */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-coral-500/10 px-3 py-1 text-xs font-medium text-coral-700">
            {researchTypeLabel(entry.research_type)}
          </span>
          {entry.quality_score != null && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                entry.quality_score >= 85
                  ? "border-green-200 bg-green-50 text-green-700"
                  : entry.quality_score >= 70
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : entry.quality_score >= 65
                      ? "border-coral-500/20 bg-coral-500/10 text-coral-700"
                      : "border-red-200 bg-red-50 text-red-700",
              )}
            >
              <span className={cn(
                "h-2 w-2 rounded-full",
                entry.quality_score >= 85 ? "bg-green-700" : entry.quality_score >= 70 ? "bg-amber-700" : entry.quality_score >= 65 ? "bg-coral-700" : "bg-red-700",
              )} />
              Evidence Score: {entry.quality_score}/100
            </span>
          )}
          {entry.impact_score != null && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                entry.impact_score >= 85
                  ? "border-green-200 bg-green-50 text-green-700"
                  : entry.impact_score >= 70
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : entry.impact_score >= 65
                      ? "border-coral-500/20 bg-coral-500/10 text-coral-700"
                      : "border-red-200 bg-red-50 text-red-700",
              )}
            >
              <span className={cn(
                "h-2 w-2 rounded-full",
                entry.impact_score >= 85 ? "bg-green-700" : entry.impact_score >= 70 ? "bg-amber-700" : entry.impact_score >= 65 ? "bg-coral-700" : "bg-red-700",
              )} />
              Impact Score: {entry.impact_score}/100
            </span>
          )}
        </div>

        {/* Copy / Share */}
        <div className="mt-4 flex items-center gap-2">
          <CopyButton
            text={[entry.title, entry.attributed_summary, entry.source_url].filter(Boolean).join("\n")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:shadow-sm transition cursor-pointer"
          />
          <ShareButton
            url={`https://uxmind.ai/research/${entry.slug}`}
            title={entry.title}
          />
        </div>
      </header>

      {/* Score legend */}
      {(entry.quality_score != null || entry.impact_score != null) && (
        <div className="mt-3 flex flex-col gap-0.5 text-[11px] leading-relaxed text-text-muted">
          {entry.quality_score != null && (
            <p><span className="font-medium text-text-secondary">Evidence Score:</span> How rigorous is the research methodology? Rated on methodology, sample size, recency, and source authority.</p>
          )}
          {entry.impact_score != null && (
            <p><span className="font-medium text-text-secondary">Impact Score:</span> How actionable are the findings for design decisions? Rated on practical applicability, specificity, and design relevance.</p>
          )}
        </div>
      )}

      {/* Summary cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Key Findings */}
        <div className="rounded-xl border border-card-border/50 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-muted">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-8 4 4 4-8" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wide">Key Findings</span>
          </div>
          <p className="mt-2 text-lg font-bold text-text-primary">
            {entry.key_findings?.length ?? 0} {(entry.key_findings?.length ?? 0) === 1 ? "finding" : "findings"}
          </p>
          <p className="text-xs text-text-muted">{researchTypeLabel(entry.research_type)}</p>
        </div>

        {/* Methodology */}
        <div className="rounded-xl border border-card-border/50 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-muted">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
              <path d="M16 16l2 2" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wide">Methodology</span>
          </div>
          <p className="mt-2 text-lg font-bold text-text-primary">
            {researchTypeLabel(entry.research_type)}
          </p>
          {entry.sample_size && (
            <p className="text-xs text-text-muted">n={entry.sample_size.toLocaleString()}</p>
          )}
        </div>

        {/* Limitations */}
        <div className="rounded-xl border border-card-border/50 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-muted">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wide">Limitations</span>
          </div>
          <p className="mt-2 text-lg font-bold text-text-primary">
            {entry.limitations && entry.limitations.length > 0
              ? `${entry.limitations.length} noted`
              : "None noted"}
          </p>
        </div>
      </div>

      {/* Summary */}
      {entry.attributed_summary && (
        <section className="mt-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Summary</h2>
          <div className="mt-3 rounded-xl border-l-2 border-coral-500 bg-card p-5 shadow-sm">
            <p className="text-sm leading-relaxed text-text-secondary">
              {entry.attributed_summary}
            </p>
          </div>
        </section>
      )}

      {/* Key findings */}
      {entry.key_findings && entry.key_findings.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Key Findings</h2>
          <ul className="mt-3 space-y-2">
            {entry.key_findings.map((finding, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-500" />
                {finding}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Methodology */}
      {(entry.methodology_summary || entry.sample_size) && (
        <section className="mt-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Methodology</h2>
          <div className="mt-3 rounded-xl border border-card-border/50 bg-card p-5 shadow-sm">
            {entry.methodology_summary && (
              <p className="text-sm leading-relaxed text-text-secondary">
                {entry.methodology_summary}
              </p>
            )}
            {entry.sample_size && (
              <p className="mt-3 text-sm text-text-muted">
                <span className="font-medium text-text-secondary">Sample size:</span>{" "}
                {entry.sample_size.toLocaleString()}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Limitations */}
      {entry.limitations && entry.limitations.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Limitations</h2>
          <ul className="mt-3 space-y-2">
            {entry.limitations.map((limitation, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-text-muted"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-surface-700" />
                {limitation}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tags and contexts */}
      {((entry.tags && entry.tags.length > 0) ||
        (entry.site_contexts && entry.site_contexts.length > 0)) && (
        <section className="mt-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Tags &amp; Contexts
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {entry.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-800 px-3 py-1 text-xs font-medium text-text-muted"
              >
                {tag}
              </span>
            ))}
            {entry.site_contexts?.map((ctx) => (
              <span
                key={ctx}
                className="rounded-full border border-card-border px-3 py-1 text-xs font-medium text-text-muted"
              >
                {siteContextLabel(ctx)}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="mt-14 border-t border-surface-700 pt-8">
        <BackLink fallbackHref="/research" label="Back to Research" />
      </div>
    </div>
  );
}
