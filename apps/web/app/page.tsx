import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 3600;

export default async function HomePage() {
  const supabase = createServerClient();

  const [
    { count: researchCount },
    { count: lawsCount },
    { count: mythsCount },
    { data: sources },
  ] = await Promise.all([
    supabase.from("research_entries").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("ux_laws").select("*", { count: "exact", head: true }),
    supabase.from("debunked_myths").select("*", { count: "exact", head: true }),
    supabase.from("research_entries").select("source_name").eq("status", "published"),
  ]);

  const safeResearchCount = researchCount ?? 0;
  const safeLawsCount = lawsCount ?? 0;
  const safeMythsCount = mythsCount ?? 0;
  const uniqueSources = new Set(sources?.map((s) => s.source_name)).size;

  return (
    <div className="flex flex-col">
      {/* Hero — chat-first */}
      <section className="relative flex flex-col items-center px-4 pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-coral-500/8 blur-[120px]" />

        <p className="text-sm font-medium tracking-wider uppercase text-coral-500 mb-4">
          Still designing for humans
        </p>
        <h1 className="text-center text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl max-w-3xl leading-tight">
          The human truth behind every great interface
        </h1>
        <p className="mt-5 text-center text-lg text-text-secondary max-w-2xl leading-relaxed">
          Ask questions about evidence-based UX research. Backed by {safeResearchCount}+ vetted studies,{" "}
          {safeLawsCount} cognitive principles, and {uniqueSources} authoritative sources.
        </p>

        {/* Chat input CTA */}
        <div className="mt-10 w-full max-w-2xl">
          <form action="/chat" method="GET" className="group block">
            <div className="flex items-center gap-3 rounded-2xl border border-surface-600 bg-surface-800 px-5 py-4 transition-all focus-within:border-coral-500/50 focus-within:bg-surface-700 hover:border-coral-500/50 hover:bg-surface-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted shrink-0" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <input
                type="text"
                name="q"
                placeholder="Ask about UX research..."
                aria-label="Ask about UX research"
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
              />
              <button
                type="submit"
                className="ml-auto rounded-lg bg-coral-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-coral-600 transition-colors"
              >
                Ask AI
              </button>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              "What makes checkout flows convert?",
              "How fast are first impressions?",
              "Mobile form best practices",
              "Does infinite scroll hurt UX?",
            ].map((q) => (
              <a
                key={q}
                href={`/chat?q=${encodeURIComponent(q)}`}
                className="rounded-full border border-surface-600 bg-surface-800/50 px-3 py-1 text-xs text-text-muted hover:text-text-secondary hover:border-surface-500 transition-colors"
              >
                {q}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-surface-700/50 bg-surface-800/30">
        <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 divide-x divide-surface-700/50">
          {[
            { value: safeResearchCount, label: "Research Studies" },
            { value: safeLawsCount, label: "UX Laws" },
            { value: safeMythsCount, label: "Debunked Myths" },
            { value: uniqueSources, label: "Sources" },
          ].map((stat) => (
            <div key={stat.label} className="px-4 py-6 text-center">
              <p className="text-2xl font-bold text-coral-500">{stat.value}</p>
              <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse cards */}
      <section className="mx-auto max-w-6xl w-full px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <Link href="/research" className="group rounded-2xl border border-surface-600 bg-surface-800 p-6 hover:border-coral-500/30 hover:bg-surface-700 transition-all">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-500" aria-hidden="true">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary group-hover:text-coral-400 transition-colors">Research Library</h3>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              {safeResearchCount}+ vetted studies from NNGroup, Baymard, ACM CHI, and more.
            </p>
          </Link>
          <Link href="/ux-laws" className="group rounded-2xl border border-surface-600 bg-surface-800 p-6 hover:border-coral-500/30 hover:bg-surface-700 transition-all">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-500" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary group-hover:text-coral-400 transition-colors">UX Laws</h3>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              {safeLawsCount} cognitive principles governing human-interface interaction.
            </p>
          </Link>
          <Link href="/myths" className="group rounded-2xl border border-surface-600 bg-surface-800 p-6 hover:border-coral-500/30 hover:bg-surface-700 transition-all">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-500" aria-hidden="true">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary group-hover:text-coral-400 transition-colors">Debunked Myths</h3>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              {safeMythsCount} common UX assumptions the evidence doesn&apos;t support.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
