import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { FilterSelect } from "@/components/filter-select";

export const revalidate = 3600;

export const metadata = {
  title: "UX Laws & Principles — UXMind.ai",
  description:
    "Browse evidence-based UX laws and design principles, each rated by confidence level.",
};

const CATEGORIES = [
  { value: "cognitive", label: "Cognitive" },
  { value: "visual", label: "Visual" },
  { value: "interaction", label: "Interaction" },
  { value: "memory", label: "Memory" },
  { value: "decision_making", label: "Decision Making" },
  { value: "attention", label: "Attention" },
  { value: "perception", label: "Perception" },
  { value: "learning", label: "Learning" },
] as const;

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; view?: string }>;
}

function sanitizeQuery(q: string): string {
  return q.replace(/[.,()]/g, " ").trim();
}

export default async function UxLawsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = sanitizeQuery(params.q?.trim() ?? "");
  const activeCategory = params.category || "";
  const activeView = params.view || "grid";

  const supabase = createServerClient();

  let request = supabase
    .from("ux_laws")
    .select("name, slug, description, category", { count: "exact" })
    .order("sort_order");

  if (query) {
    request = request.or(
      `name.ilike.%${query}%,description.ilike.%${query}%`,
    );
  }

  if (activeCategory) {
    request = request.eq("category", activeCategory);
  }

  const { data: laws, count } = await request;

  const items = laws ?? [];
  const total = count ?? items.length;

  function buildHref(overrides: Record<string, string>) {
    const merged: Record<string, string> = {};
    if (query) merged.q = query;
    if (activeCategory) merged.category = activeCategory;
    if (activeView !== "grid") merged.view = activeView;
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) merged[k] = v;
      else delete merged[k];
    });
    const qs = new URLSearchParams(merged).toString();
    return qs ? `/ux-laws?${qs}` : "/ux-laws";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          UX Laws &amp; Principles
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {total} {total === 1 ? "law" : "laws"} in the knowledge base
        </p>
      </div>

      {/* Filter bar */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {/* Search */}
        <form action="/ux-laws" method="GET" className="w-full sm:max-w-xs">
          {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
          {activeView !== "grid" && <input type="hidden" name="view" value={activeView} />}
          <div className="relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search laws..."
              aria-label="Search UX laws"
              className="w-full rounded-lg border border-surface-600 bg-surface-800 py-2 pl-3 pr-10 text-sm text-text-primary shadow-sm transition placeholder:text-text-muted focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20"
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

        {/* Dropdowns + View Toggle */}
        <form action="/ux-laws" method="GET" className="flex flex-wrap items-center gap-3">
          {query && <input type="hidden" name="q" value={query} />}
          {activeView !== "grid" && <input type="hidden" name="view" value={activeView} />}

          <FilterSelect
            name="category"
            value={activeCategory}
            options={[
              { value: "", label: "All Categories" },
              ...CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
            ]}
          />

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-surface-600 bg-surface-800">
            <Link
              href={buildHref({ view: "" })}
              aria-label="Grid view"
              className={cn(
                "flex items-center px-2.5 py-2 rounded-l-lg transition",
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
              href={buildHref({ view: "list" })}
              aria-label="List view"
              className={cn(
                "flex items-center px-2.5 py-2 rounded-r-lg transition",
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
        </form>
      </div>

      {/* Results */}
      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-600 py-20 text-center">
          <p className="text-sm text-text-muted">No results match your filters.</p>
          <Link href="/ux-laws" className="mt-3 text-sm font-medium text-coral-400 hover:text-coral-500">Clear filters</Link>
        </div>
      ) : activeView === "list" ? (
        /* List view */
        <div className="mt-10 flex flex-col gap-3">
          {items.map((law) => (
            <Link
              key={law.slug}
              href={`/ux-laws/${law.slug}`}
              className="group flex items-start gap-4 rounded-xl border border-surface-600 bg-surface-800 p-4 transition hover:border-coral-500/30"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {law.category && (
                    <span className="rounded-full bg-coral-500/10 px-2.5 py-0.5 text-[11px] font-medium text-coral-400 capitalize">
                      {law.category}
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-semibold text-text-primary group-hover:text-coral-400 transition">
                  {law.name}
                </h2>
                <p className="mt-0.5 text-xs text-text-secondary line-clamp-2">
                  {law.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Grid view */
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((law) => (
            <Link
              key={law.slug}
              href={`/ux-laws/${law.slug}`}
              className="group flex flex-col rounded-xl border border-surface-600 bg-surface-800 p-5 transition hover:border-coral-500/40 hover:shadow-lg hover:shadow-coral-500/5"
            >
              {law.category && (
                <span className="mb-3 inline-flex w-fit rounded-full bg-coral-500/10 px-2.5 py-0.5 text-[11px] font-medium text-coral-400 capitalize">
                  {law.category}
                </span>
              )}
              <h2 className="text-base font-semibold text-text-primary group-hover:text-coral-400">
                {law.name}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-secondary">
                {law.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
