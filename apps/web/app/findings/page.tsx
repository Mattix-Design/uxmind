import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { cn, researchTypeLabel } from "@/lib/utils";
import { FilterSelect } from "@/components/filter-select";
import { CopyButton } from "@/components/copy-button";

export const revalidate = 3600;

export const metadata = {
  title: "UX Findings — UXMind.ai",
  description:
    "Browse individual UX research findings extracted from vetted studies.",
};

const RESEARCH_TYPES = [
  { value: "", label: "All Types" },
  { value: "user_testing", label: "User Testing" },
  { value: "analytics_based", label: "Analytics" },
  { value: "survey", label: "Survey" },
  { value: "academic", label: "Academic" },
  { value: "mixed_methods", label: "Mixed Methods" },
] as const;

interface Finding {
  text: string;
  researchTitle: string;
  researchSlug: string;
  qualityScore: number | null;
  impactScore: number | null;
  sourceName: string | null;
  tags: string[] | null;
  researchType: string;
  authors: string[] | null;
  publicationDate: string | null;
}

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "impact_desc", label: "Highest Impact" },
  { value: "evidence_desc", label: "Highest Evidence" },
] as const;

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string; view?: string; sort?: string; source?: string; year?: string }>;
}

export default async function FindingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const activeType = params.type || "";
  const activeView = params.view || "list";
  const activeSort = params.sort || "impact_desc";
  const activeSource = params.source || "";
  const activeYear = params.year || "";

  const supabase = createServerClient();

  const { data: entries, error } = await supabase
    .from("research_entries")
    .select(
      "title, slug, key_findings, quality_score, impact_score, source_name, tags, research_type, authors, publication_date"
    )
    .eq("status", "published");

  if (error) {
    console.error("Failed to fetch research entries:", error);
  }

  // Build source and year options from all entries before filtering
  const allEntries = entries || [];
  const sourceSet = new Set<string>();
  const yearSet = new Set<string>();
  for (const e of allEntries) {
    if (e.source_name) sourceSet.add(e.source_name);
    if (e.publication_date) {
      const y = String(e.publication_date).slice(0, 4);
      if (y.length === 4) yearSet.add(y);
    }
  }
  const sourceOptions = [
    { value: "", label: "All Sources" },
    ...Array.from(sourceSet).sort().map((s) => ({ value: s, label: s })),
  ];
  const yearOptions = [
    { value: "", label: "All Years" },
    ...Array.from(yearSet).sort().reverse().map((y) => ({ value: y, label: y })),
  ];

  // Flatten entries into individual findings
  let findings: Finding[] = allEntries.flatMap(
    (e: any) =>
      e.key_findings?.map((f: string) => ({
        text: f,
        researchTitle: e.title,
        researchSlug: e.slug,
        qualityScore: e.quality_score,
        impactScore: e.impact_score,
        sourceName: e.source_name,
        tags: e.tags,
        researchType: e.research_type,
        authors: e.authors,
        publicationDate: e.publication_date,
      })) ?? []
  );

  // Filter by search query
  if (query) {
    const q = query.toLowerCase();
    findings = findings.filter((f) => f.text.toLowerCase().includes(q));
  }

  // Filter by research type
  if (activeType) {
    findings = findings.filter((f) => f.researchType === activeType);
  }

  // Filter by source
  if (activeSource) {
    findings = findings.filter((f) => f.sourceName === activeSource);
  }

  // Filter by year
  if (activeYear) {
    findings = findings.filter((f) => f.publicationDate && String(f.publicationDate).startsWith(activeYear));
  }

  // Sort findings
  if (activeSort === "impact_desc") {
    findings.sort((a, b) => (b.impactScore ?? -1) - (a.impactScore ?? -1));
  } else if (activeSort === "evidence_desc") {
    findings.sort((a, b) => (b.qualityScore ?? -1) - (a.qualityScore ?? -1));
  }

  function buildHref(overrides: Record<string, string>) {
    const merged: Record<string, string> = {};
    if (activeType) merged.type = activeType;
    if (query) merged.q = query;
    if (activeView !== "list") merged.view = activeView;
    if (activeSort !== "impact_desc") merged.sort = activeSort;
    if (activeSource) merged.source = activeSource;
    if (activeYear) merged.year = activeYear;
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) merged[k] = v;
      else delete merged[k];
    });
    const qs = new URLSearchParams(merged).toString();
    return qs ? `/findings?${qs}` : "/findings";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-text-primary">
          UX Findings
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {findings.length} {findings.length === 1 ? "finding" : "findings"}{" "}
          extracted from vetted research
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex flex-col gap-3">
        {/* Row 1: Search (full width) */}
        <form action="/findings" method="GET">
          {activeType && <input type="hidden" name="type" value={activeType} />}
          {activeSource && <input type="hidden" name="source" value={activeSource} />}
          {activeYear && <input type="hidden" name="year" value={activeYear} />}
          {activeSort !== "impact_desc" && <input type="hidden" name="sort" value={activeSort} />}
          {activeView !== "list" && <input type="hidden" name="view" value={activeView} />}
          <div className="relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search findings..."
              aria-label="Search findings"
              className="w-full rounded-lg border border-card-border bg-card py-2 pl-3 pr-10 text-sm text-text-primary shadow-sm transition placeholder:text-text-muted focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 flex items-center px-3 text-text-muted hover:text-text-secondary"
              aria-label="Search"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.65 4.65a7.5 7.5 0 0012 12z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Row 2: Filters left, view toggle right */}
        <div className="flex items-center justify-between gap-3">
          <form action="/findings" method="GET" className="flex flex-wrap items-center gap-2">
            {query && <input type="hidden" name="q" value={query} />}
            {activeView !== "list" && <input type="hidden" name="view" value={activeView} />}

            <FilterSelect
              name="type"
              value={activeType}
              ariaLabel="Filter by research type"
              options={RESEARCH_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            />

            <FilterSelect
              name="source"
              value={activeSource}
              ariaLabel="Filter by source"
              options={sourceOptions}
            />

            <FilterSelect
              name="year"
              value={activeYear}
              ariaLabel="Filter by year"
              options={yearOptions}
            />

            <FilterSelect
              name="sort"
              value={activeSort}
              ariaLabel="Sort by"
              options={SORT_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
            />
          </form>

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-card-border bg-card shrink-0">
            <Link
              href={buildHref({ view: "grid" })}
              className={cn(
                "flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-3 rounded-l-lg transition focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:outline-none",
                activeView === "grid"
                  ? "bg-coral-500 text-white"
                  : "text-text-muted hover:text-text-secondary"
              )}
              aria-label="Grid view"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
            </Link>
            <Link
              href={buildHref({ view: "" })}
              className={cn(
                "flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-3 rounded-r-lg transition focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:outline-none",
                activeView === "list"
                  ? "bg-coral-500 text-white"
                  : "text-text-muted hover:text-text-secondary"
              )}
              aria-label="List view"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Results */}
      {findings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-card-border py-20 text-center">
          <p className="text-sm text-text-muted">
            No findings match your filters.
          </p>
          <Link
            href="/findings"
            className="mt-3 text-sm font-medium text-coral-500 hover:text-coral-700"
          >
            Clear filters
          </Link>
        </div>
      ) : activeView === "list" ? (
        <div className="flex flex-col gap-3">
          {findings.map((finding, i) => (
            <article
              key={`${finding.researchSlug}-${i}`}
              className="group relative flex items-start gap-4 rounded-xl border border-card-border/50 bg-card p-4 shadow-sm transition hover:shadow-md hover:bg-card-hover"
            >
              <Link href={`/research/${finding.researchSlug}`} className="absolute inset-0 z-0 rounded-xl focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:outline-none" aria-label={finding.researchTitle}>
                <span className="sr-only">{finding.researchTitle}</span>
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary group-hover:text-coral-500">
                  {finding.text}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                  <span className="truncate">
                    {finding.researchTitle}
                  </span>
                  {finding.sourceName && (
                    <>
                      <span>&middot;</span>
                      <span>{finding.sourceName}</span>
                    </>
                  )}
                  {finding.qualityScore != null && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                        finding.qualityScore >= 85
                          ? "border-green-200 bg-green-50 text-green-700"
                          : finding.qualityScore >= 70
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : finding.qualityScore >= 65
                              ? "border-coral-500/20 bg-coral-500/10 text-coral-700"
                              : "border-red-200 bg-red-50 text-red-700",
                      )}
                      title="Evidence Score"
                    >
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        finding.qualityScore >= 85 ? "bg-green-700" : finding.qualityScore >= 70 ? "bg-amber-700" : finding.qualityScore >= 65 ? "bg-coral-700" : "bg-red-700",
                      )} />
                      <span className="text-[9px] font-medium text-[10px]">Evidence</span> {finding.qualityScore}
                    </span>
                  )}
                  {finding.impactScore != null && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                        finding.impactScore >= 85
                          ? "border-green-200 bg-green-50 text-green-700"
                          : finding.impactScore >= 70
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : finding.impactScore >= 65
                              ? "border-coral-500/20 bg-coral-500/10 text-coral-700"
                              : "border-red-200 bg-red-50 text-red-700",
                      )}
                      title="Impact Score"
                    >
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        finding.impactScore >= 85 ? "bg-green-700" : finding.impactScore >= 70 ? "bg-amber-700" : finding.impactScore >= 65 ? "bg-coral-700" : "bg-red-700",
                      )} />
                      <span className="text-[9px] font-medium text-[10px]">Impact</span> {finding.impactScore}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative z-10">
                <CopyButton text={`${finding.text}\n— ${finding.researchTitle}${finding.sourceName ? ` (${finding.sourceName})` : ""}`} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {findings.map((finding, i) => (
            <article
              key={`${finding.researchSlug}-${i}`}
              className="group relative flex flex-col rounded-xl border border-card-border/50 bg-card p-5 shadow-sm transition hover:shadow-md hover:bg-card-hover"
            >
              <Link href={`/research/${finding.researchSlug}`} className="absolute inset-0 z-0 rounded-xl focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:outline-none" aria-label={finding.researchTitle}>
                <span className="sr-only">{finding.researchTitle}</span>
              </Link>
              {/* Finding text + copy */}
              <div className="mb-4 flex items-start gap-2">
                <p className="flex-1 text-sm leading-relaxed text-text-primary">
                  {finding.text}
                </p>
                <div className="relative z-10">
                  <CopyButton text={`${finding.text}\n— ${finding.researchTitle}${finding.sourceName ? ` (${finding.sourceName})` : ""}`} />
                </div>
              </div>

              {/* Meta */}
              <div className="mt-auto flex flex-col gap-3">
                {/* Parent research link + source */}
                <div className="text-xs text-text-muted">
                  <span className="font-medium text-text-secondary">
                    {finding.researchTitle}
                  </span>
                  {finding.sourceName && (
                    <>
                      <span className="mx-1.5">&middot;</span>
                      <span>{finding.sourceName}</span>
                    </>
                  )}
                </div>

                {/* Quality score badge + tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {finding.qualityScore != null && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                        finding.qualityScore >= 85
                          ? "border-green-200 bg-green-50 text-green-700"
                          : finding.qualityScore >= 70
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : finding.qualityScore >= 65
                              ? "border-coral-500/20 bg-coral-500/10 text-coral-700"
                              : "border-red-200 bg-red-50 text-red-700",
                      )}
                      title="Evidence Score"
                    >
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        finding.qualityScore >= 85 ? "bg-green-700" : finding.qualityScore >= 70 ? "bg-amber-700" : finding.qualityScore >= 65 ? "bg-coral-700" : "bg-red-700",
                      )} />
                      {finding.qualityScore}
                    </span>
                  )}
                  {finding.impactScore != null && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                        finding.impactScore >= 85
                          ? "border-green-200 bg-green-50 text-green-700"
                          : finding.impactScore >= 70
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : finding.impactScore >= 65
                              ? "border-coral-500/20 bg-coral-500/10 text-coral-700"
                              : "border-red-200 bg-red-50 text-red-700",
                      )}
                      title="Impact Score"
                    >
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        finding.impactScore >= 85 ? "bg-green-700" : finding.impactScore >= 70 ? "bg-amber-700" : finding.impactScore >= 65 ? "bg-coral-700" : "bg-red-700",
                      )} />
                      {finding.impactScore}
                    </span>
                  )}
                  {Array.isArray(finding.tags) &&
                    finding.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-md bg-surface-800 px-2 py-0.5 text-[11px] text-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
