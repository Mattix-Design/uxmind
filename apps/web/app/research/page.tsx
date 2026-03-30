import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import {
  cn,
  formatDate,
  researchTypeLabel,
  siteContextLabel,
} from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { FilterSelect } from "@/components/filter-select";

const RESEARCH_TYPES = [
  { value: "user_testing", label: "User Testing" },
  { value: "analytics_based", label: "Analytics" },
  { value: "survey", label: "Survey" },
  { value: "academic", label: "Academic" },
  { value: "mixed_methods", label: "Mixed Methods" },
] as const;

const SITE_CONTEXTS = [
  "ecommerce_general",
  "ecommerce_checkout",
  "ecommerce_discovery",
  "lead_generation",
  "saas",
  "news_media",
  "content_publishing",
  "mobile_app",
  "landing_pages",
  "onboarding",
  "forms_data_entry",
  "accessibility",
  "navigation_ia",
  "search_filtering",
] as const;

const SORT_OPTIONS = [
  { value: "publication_date_desc", label: "Newest First", column: "publication_date", ascending: false },
  { value: "impact_score_desc", label: "Highest Impact", column: "impact_score", ascending: false },
  { value: "quality_score_desc", label: "Highest Evidence", column: "quality_score", ascending: false },
  { value: "title_asc", label: "Title A-Z", column: "title", ascending: true },
] as const;

interface PageProps {
  searchParams: Promise<{ type?: string; sort?: string; q?: string; context?: string; view?: string; source?: string; year?: string }>;
}

export default async function ResearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeType = params.type || "";
  const activeContext = params.context || "";
  const activeSort = params.sort || "impact_score_desc";
  const query = params.q || "";
  const activeView = params.view || "list";
  const activeSource = params.source || "";
  const activeYear = params.year || "";

  const sortOption =
    SORT_OPTIONS.find((s) => s.value === activeSort) || SORT_OPTIONS[0];

  const supabase = createServerClient();

  // Fetch all published entries first for building filter options
  const { data: allEntries } = await supabase
    .from("research_entries")
    .select("source_name, publication_date")
    .eq("status", "published");

  const sourceSet = new Set<string>();
  const yearSet = new Set<string>();
  for (const e of allEntries || []) {
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

  let dbQuery = supabase
    .from("research_entries")
    .select("*")
    .eq("status", "published");

  if (activeType) {
    dbQuery = dbQuery.eq("research_type", activeType);
  }

  if (activeContext) {
    dbQuery = dbQuery.contains("site_contexts", [activeContext]);
  }

  if (activeSource) {
    dbQuery = dbQuery.eq("source_name", activeSource);
  }

  if (activeYear) {
    dbQuery = dbQuery.gte("publication_date", `${activeYear}-01-01`).lte("publication_date", `${activeYear}-12-31`);
  }

  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }

  dbQuery = dbQuery.order(sortOption.column, { ascending: sortOption.ascending, nullsFirst: false });

  const { data: entries, error } = await dbQuery;

  if (error) {
    console.error("Failed to fetch research entries:", error);
  }

  const results = entries || [];

  function buildHref(overrides: Record<string, string>) {
    const merged: Record<string, string> = {};
    if (activeType) merged.type = activeType;
    if (activeContext) merged.context = activeContext;
    if (activeSort !== "impact_score_desc") merged.sort = activeSort;
    if (query) merged.q = query;
    if (activeView !== "list") merged.view = activeView;
    if (activeSource) merged.source = activeSource;
    if (activeYear) merged.year = activeYear;
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) merged[k] = v;
      else delete merged[k];
    });
    const qs = new URLSearchParams(merged).toString();
    return qs ? `/research?${qs}` : "/research";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-text-primary">
          Research Library
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {results.length} {results.length === 1 ? "entry" : "entries"} found
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex flex-col gap-3">
        {/* Row 1: Search (full width) */}
        <form action="/research" method="GET">
          {activeType && <input type="hidden" name="type" value={activeType} />}
          {activeContext && <input type="hidden" name="context" value={activeContext} />}
          {activeSource && <input type="hidden" name="source" value={activeSource} />}
          {activeYear && <input type="hidden" name="year" value={activeYear} />}
          {activeSort !== "impact_score_desc" && <input type="hidden" name="sort" value={activeSort} />}
          {activeView !== "list" && <input type="hidden" name="view" value={activeView} />}
          <div className="relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by title..."
              aria-label="Search research"
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
          <form action="/research" method="GET" className="flex flex-wrap items-center gap-2">
            {query && <input type="hidden" name="q" value={query} />}
            {activeView !== "list" && <input type="hidden" name="view" value={activeView} />}

            <FilterSelect
              name="type"
              value={activeType}
              ariaLabel="Filter by research type"
              options={[
                { value: "", label: "All Types" },
                ...RESEARCH_TYPES.map((t) => ({ value: t.value, label: t.label })),
              ]}
            />

            <FilterSelect
              name="context"
              value={activeContext}
              ariaLabel="Filter by site context"
              options={[
                { value: "", label: "All Contexts" },
                ...SITE_CONTEXTS.map((ctx) => ({ value: ctx, label: siteContextLabel(ctx) })),
              ]}
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
              aria-label="Grid view"
              className={cn(
                "flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-3 rounded-l-lg transition focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:outline-none",
                activeView === "grid"
                  ? "bg-coral-500 text-white"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
            </Link>
            <Link
              href={buildHref({ view: "" })}
              aria-label="List view"
              className={cn(
                "flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-3 rounded-r-lg transition focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:outline-none",
                activeView === "list"
                  ? "bg-coral-500 text-white"
                  : "text-text-muted hover:text-text-secondary",
              )}
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
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-card-border py-20 text-center">
          <p className="text-sm text-text-muted">No research entries match your filters.</p>
          <Link href="/research" className="mt-3 text-sm font-medium text-coral-500 hover:text-coral-600">
            Clear filters
          </Link>
        </div>
      ) : activeView === "list" ? (
        /* List view */
        <div className="flex flex-col gap-3">
          {results.map((entry: any) => (
            <article
              key={entry.id}
              className="group relative flex items-start gap-4 rounded-xl border border-card-border/50 bg-card p-4 shadow-sm transition hover:shadow-md hover:bg-card-hover"
            >
              <Link href={`/research/${entry.slug}`} className="absolute inset-0 z-0 rounded-xl focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:outline-none" aria-label={entry.title}>
                <span className="sr-only">{entry.title}</span>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-coral-500/10 px-2.5 py-0.5 text-[11px] font-medium text-coral-700">
                    {researchTypeLabel(entry.research_type)}
                  </span>
                  {entry.quality_score != null && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                        entry.quality_score >= 85
                          ? "border-green-200 bg-green-50 text-green-700"
                          : entry.quality_score >= 70
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : entry.quality_score >= 65
                              ? "border-coral-500/20 bg-coral-500/10 text-coral-700"
                              : "border-red-200 bg-red-50 text-red-700",
                      )}
                      title="Evidence Score"
                    >
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        entry.quality_score >= 85 ? "bg-green-700" : entry.quality_score >= 70 ? "bg-amber-700" : entry.quality_score >= 65 ? "bg-coral-700" : "bg-red-700",
                      )} />
                      <span className="text-[10px] font-medium">Evidence</span> {entry.quality_score}
                    </span>
                  )}
                  {entry.impact_score != null && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                        entry.impact_score >= 85
                          ? "border-green-200 bg-green-50 text-green-700"
                          : entry.impact_score >= 70
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : entry.impact_score >= 65
                              ? "border-coral-500/20 bg-coral-500/10 text-coral-700"
                              : "border-red-200 bg-red-50 text-red-700",
                      )}
                      title="Impact Score"
                    >
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        entry.impact_score >= 85 ? "bg-green-700" : entry.impact_score >= 70 ? "bg-amber-700" : entry.impact_score >= 65 ? "bg-coral-700" : "bg-red-700",
                      )} />
                      <span className="text-[10px] font-medium">Impact</span> {entry.impact_score}
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-semibold text-text-primary group-hover:text-coral-500 transition">
                  {entry.title}
                </h2>
                <p className="mt-0.5 text-xs text-text-muted">
                  {entry.source_name}
                  {entry.publication_date && ` \u00b7 ${formatDate(entry.publication_date)}`}
                </p>
                {entry.attributed_summary && (
                  <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                    {entry.attributed_summary}
                  </p>
                )}
              </div>
              <div className="relative z-10">
                <CopyButton
                  text={[entry.title, entry.attributed_summary, entry.source_url].filter(Boolean).join("\n")}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Grid view */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((entry: any) => (
            <article
              key={entry.id}
              className="group relative flex flex-col rounded-xl border border-card-border/50 bg-card shadow-sm transition hover:shadow-md hover:bg-card-hover"
            >
              <Link href={`/research/${entry.slug}`} className="absolute inset-0 z-0 rounded-xl focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:outline-none" aria-label={entry.title}>
                <span className="sr-only">{entry.title}</span>
              </Link>
              <div className="flex flex-1 flex-col p-5">
                {/* Research type pill + Evidence Score + Copy */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-coral-500/10 px-2.5 py-0.5 text-[11px] font-medium text-coral-700">
                    {researchTypeLabel(entry.research_type)}
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    {entry.quality_score != null && (
                      <span
                        className={cn(
                          "inline-flex flex-col items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-tight",
                          entry.quality_score >= 85
                            ? "border-green-200 bg-green-50 text-green-700"
                            : entry.quality_score >= 70
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : entry.quality_score >= 65
                                ? "border-coral-500/20 bg-coral-500/10 text-coral-700"
                                : "border-red-200 bg-red-50 text-red-700",
                        )}
                        title="Evidence Score"
                      >
                        <span className="text-[9px] font-medium uppercase tracking-wide">Evidence</span>
                        <span className="flex items-center gap-1">
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            entry.quality_score >= 85 ? "bg-green-700" : entry.quality_score >= 70 ? "bg-amber-700" : entry.quality_score >= 65 ? "bg-coral-700" : "bg-red-700",
                          )} />
                          {entry.quality_score}
                        </span>
                      </span>
                    )}
                    {entry.impact_score != null && (
                      <span
                        className={cn(
                          "inline-flex flex-col items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-tight",
                          entry.impact_score >= 85
                            ? "border-green-200 bg-green-50 text-green-700"
                            : entry.impact_score >= 70
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : entry.impact_score >= 65
                                ? "border-coral-500/20 bg-coral-500/10 text-coral-700"
                                : "border-red-200 bg-red-50 text-red-700",
                        )}
                        title="Impact Score"
                      >
                        <span className="text-[9px] font-medium uppercase tracking-wide">Impact</span>
                        <span className="flex items-center gap-1">
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            entry.impact_score >= 85 ? "bg-green-700" : entry.impact_score >= 70 ? "bg-amber-700" : entry.impact_score >= 65 ? "bg-coral-700" : "bg-red-700",
                          )} />
                          {entry.impact_score}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="relative z-10">
                    <CopyButton
                      text={[entry.title, entry.attributed_summary, entry.source_url].filter(Boolean).join("\n")}
                      className={cn(
                        "shrink-0 rounded-md p-1 text-text-muted hover:text-text-secondary hover:bg-surface-800 transition cursor-pointer",
                        entry.quality_score == null && entry.impact_score == null && "ml-auto",
                      )}
                    />
                  </div>
                </div>

                {/* Title */}
                <h2 className="mb-1 text-base font-semibold leading-snug text-text-primary group-hover:text-coral-500 transition">
                  {entry.title}
                </h2>

                {/* Source + date */}
                <p className="mb-3 text-xs text-text-muted">
                  {entry.source_name && <span>{entry.source_name}</span>}
                  {entry.source_name && entry.publication_date && (
                    <span className="mx-1.5">&middot;</span>
                  )}
                  {entry.publication_date && (
                    <span>{formatDate(entry.publication_date)}</span>
                  )}
                </p>

                {/* Summary */}
                {entry.attributed_summary && (
                  <p className="mb-4 text-sm leading-relaxed text-text-secondary">
                    {entry.attributed_summary.length > 150
                      ? `${entry.attributed_summary.slice(0, 150)}...`
                      : entry.attributed_summary}
                  </p>
                )}

                {/* Tags + site contexts */}
                <div className="mt-auto flex flex-wrap gap-1.5">
                  {Array.isArray(entry.tags) &&
                    entry.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-md bg-surface-800 px-2 py-0.5 text-[11px] text-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  {Array.isArray(entry.site_contexts) &&
                    entry.site_contexts.map((ctx: string) => (
                      <span
                        key={ctx}
                        className="rounded-md border border-card-border px-2 py-0.5 text-[11px] text-text-muted"
                      >
                        {siteContextLabel(ctx)}
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
