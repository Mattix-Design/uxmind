import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export const metadata = {
  title: "Debunked UX Myths — UXMind.ai",
  description:
    "Common UX misconceptions debunked with evidence. Separate fact from fiction in design.",
};

interface PageProps {
  searchParams: Promise<{ q?: string; view?: string }>;
}

function sanitizeQuery(q: string): string {
  return q.replace(/[.,()]/g, " ").trim();
}

export default async function MythsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = sanitizeQuery(params.q?.trim() ?? "");
  const activeView = params.view || "list";

  const supabase = createServerClient();

  let request = supabase
    .from("debunked_myths")
    .select("myth, reality, source_attribution, sort_order")
    .order("sort_order");

  if (query) {
    request = request.or(`myth.ilike.%${query}%,reality.ilike.%${query}%`);
  }

  const { data: myths } = await request;

  const items = myths ?? [];

  function buildHref(overrides: Record<string, string>) {
    const merged: Record<string, string> = {};
    if (query) merged.q = query;
    if (activeView !== "list") merged.view = activeView;
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) merged[k] = v;
      else delete merged[k];
    });
    const qs = new URLSearchParams(merged).toString();
    return qs ? `/myths?${qs}` : "/myths";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-text-primary">
        Debunked UX Myths
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
        Popular beliefs that don&apos;t hold up to research scrutiny.
      </p>

      {/* Filter bar */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {/* Search */}
        <form action="/myths" method="GET" className="w-full sm:max-w-xs">
          {activeView !== "list" && <input type="hidden" name="view" value={activeView} />}
          <div className="relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search myths..."
              aria-label="Search myths"
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

        {/* View toggle */}
        <div className="flex items-center rounded-lg border border-card-border bg-card">
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

      {/* Results */}
      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-card-border py-20 text-center">
          <p className="text-sm text-text-muted">No results match your filters.</p>
          <Link href="/myths" className="mt-3 text-sm font-medium text-coral-500 hover:text-coral-600">Clear filters</Link>
        </div>
      ) : activeView === "list" ? (
        /* List view */
        <div className="mt-10 flex flex-col gap-3">
          {items.map((myth, i) => (
            <article
              key={i}
              className="flex items-start gap-4 rounded-xl border border-card-border/50 bg-card p-4 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-text-primary">
                  &ldquo;{myth.myth}&rdquo;
                </h2>
                <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                  {myth.reality}
                </p>
                {myth.source_attribution && (
                  <p className="mt-1 text-[11px] text-text-muted line-clamp-1">
                    {myth.source_attribution}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Grid view */
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {items.map((myth, i) => (
            <article
              key={i}
              className="flex flex-col rounded-xl border border-card-border/50 bg-card p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-text-primary">
                &ldquo;{myth.myth}&rdquo;
              </h2>

              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-coral-700">
                  Reality
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">{myth.reality}</p>
              </div>

              {myth.source_attribution && (
                <div className="mt-4 rounded-lg border-l-2 border-coral-500 bg-surface-800/50 p-4">
                  <p className="text-xs leading-relaxed text-text-muted">
                    {myth.source_attribution}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
