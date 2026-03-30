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
      {/* Hero -- chat-first */}
      <section className="relative flex flex-col items-center px-4 pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-coral-500/8 blur-[120px]" />

        <p className="text-xs font-semibold tracking-widest uppercase text-coral-500 mb-4">
          EVIDENCE-BASED UX RESEARCH
        </p>
        <h1 className="text-center text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl lg:text-6xl max-w-3xl leading-tight">
          UX decisions backed by real evidence.
        </h1>
        <p className="mt-5 text-center text-lg text-text-secondary max-w-2xl leading-relaxed">
          Stop designing on gut instinct, ChatGPT hallucinations, and recycled blog posts.
          UXMind gives you answers grounded in {safeResearchCount}+ peer-reviewed studies,{" "}
          {safeLawsCount} cognitive principles, and {uniqueSources} authoritative sources
          — each scored for reliability.
        </p>

        {/* Chat input CTA */}
        <div className="mt-10 w-full max-w-2xl">
          <form action="/chat" method="GET" className="group block">
            <div className="flex items-center gap-3 rounded-2xl border border-card-border bg-card px-5 py-4 shadow-sm transition-all focus-within:border-coral-500/50 focus-within:shadow-md hover:shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted shrink-0" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <input
                type="text"
                name="q"
                placeholder="What does the research actually say about..."
                aria-label="Ask about UX research"
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
              />
              <button
                type="submit"
                className="ml-auto rounded-lg bg-coral-500 px-4 py-2 text-sm font-medium text-white hover:bg-coral-600 transition-colors"
              >
                Ask UXMind
              </button>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              "Is the 3-click rule real?",
              "What makes checkout flows convert?",
              "How fast are first impressions?",
              "Does dark mode improve readability?",
            ].map((q) => (
              <a
                key={q}
                href={`/chat?q=${encodeURIComponent(q)}`}
                className="rounded-full border border-card-border bg-card px-3 py-1 text-xs text-text-muted hover:text-text-secondary hover:shadow-sm transition-all"
              >
                {q}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-surface-700/50 bg-surface-800/50">
        <h2 className="sr-only">Key Statistics</h2>
        <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 divide-x divide-surface-700/50">
          {[
            { value: safeResearchCount, label: "Research Studies" },
            { value: safeLawsCount, label: "UX Laws" },
            { value: safeMythsCount, label: "Debunked Myths" },
            { value: uniqueSources, label: "Sources" },
          ].map((stat) => (
            <div key={stat.label} className="px-4 py-6 text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-coral-500 tabular-nums tracking-tight">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why UXMind */}
      <section className="mx-auto max-w-6xl w-full px-4 py-16 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary text-center mb-3">
          Research you can actually trust.
        </h2>
        <p className="text-sm text-text-secondary text-center max-w-xl mx-auto mb-10">
          No vibes, no hallucinations — just evidence-backed answers scored for quality.
        </p>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-500" aria-hidden="true">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              ),
              title: "Vetted, not vibes.",
              body: "Every finding traces back to published research — peer-reviewed journals, academic conferences, and validated industry studies.",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-500" aria-hidden="true">
                  <path d="M3 3v18h18" />
                  <path d="M7 16l4-8 4 4 4-8" />
                </svg>
              ),
              title: "Scored on two dimensions.",
              body: "Every study gets an Evidence Score and an Impact Score. You see exactly how strong and how useful each finding is.",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-500" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ),
              title: "Always current.",
              body: "New research is added regularly. Older findings are flagged when newer evidence supersedes them.",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-500" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              ),
              title: "Built for practitioners.",
              body: "Ask in plain language. Get a synthesized answer with citations, not a wall of abstracts.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="flex flex-col items-start"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500/10">
                {card.icon}
              </div>
              <h3 className="text-base font-semibold text-text-primary">{card.title}</h3>
              <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Score explainer */}
      <section className="mx-auto max-w-6xl w-full px-4 py-16 sm:px-6">
        <div className="grid gap-0 lg:grid-cols-2 rounded-2xl border border-card-border/50 overflow-hidden shadow-sm">
            {/* Illustration — branded panel with mock research card */}
            <div className="relative flex items-center justify-center bg-gradient-to-br from-coral-500/[0.06] via-coral-500/[0.03] to-transparent p-8 sm:p-10 lg:p-12" aria-hidden="true">
              {/* Decorative dots */}
              <div className="absolute top-6 right-6 grid grid-cols-3 gap-1.5 opacity-30">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-coral-500" />
                ))}
              </div>
              <div className="absolute bottom-6 left-6 grid grid-cols-3 gap-1.5 opacity-20">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-coral-500" />
                ))}
              </div>
              {/* Decorative ring */}
              <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full border-2 border-coral-500/10" />

              <div className="relative w-full max-w-sm">
                {/* UXMind badge */}
                <div className="mb-3 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 32 32" fill="none" className="text-coral-500">
                    <path d="M4 24 L10 8 L16 20 L22 4 L28 24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                  <span className="text-[11px] font-bold tracking-wide text-coral-700 uppercase">UXMind Score</span>
                </div>
                {/* Fake research card */}
                <div className="rounded-xl border border-card-border bg-card p-5 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="rounded-full bg-coral-500/10 px-2.5 py-0.5 text-[11px] font-medium text-coral-700">User Testing</span>
                  </div>
                  <div className="h-3 w-4/5 rounded bg-surface-700/60 mb-2" />
                  <div className="h-3 w-3/5 rounded bg-surface-700/40 mb-4" />
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-2.5 w-20 rounded bg-surface-700/30" />
                    <div className="h-2.5 w-14 rounded bg-surface-700/30" />
                  </div>
                  {/* Score bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Evidence</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-700" />
                          87 — Strong
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-700/30 overflow-hidden">
                        <div className="h-full rounded-full bg-green-500" style={{ width: "87%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Impact</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-700" />
                          74 — Good
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-700/30 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: "74%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="flex flex-col justify-center bg-card p-8 sm:p-10 lg:p-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                Not all research is created equal.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                Every study in UXMind carries two scores from 0 to 100. The <strong className="text-text-primary">Evidence Score</strong> measures
                methodological rigour, sample size, recency, and source authority — how trustworthy the research is.
                The <strong className="text-text-primary">Impact Score</strong> measures practical applicability, specificity, and design relevance
                — how actionable the findings are for real design decisions.
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-2">Evidence Score</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-700" />
                      Strong (85+)
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-700" />
                      Good (70-84)
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-coral-500/20 bg-coral-500/10 px-2.5 py-1 text-xs font-semibold text-coral-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-coral-700" />
                      Moderate (65-69)
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-2">Impact Score</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-700" />
                      High (85+)
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-700" />
                      Good (70-84)
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-coral-500/20 bg-coral-500/10 px-2.5 py-1 text-xs font-semibold text-coral-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-coral-700" />
                      Moderate (65-69)
                    </span>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Browse cards */}
      <section className="mx-auto max-w-6xl w-full px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <Link href="/research" className="group rounded-2xl border border-card-border/50 bg-card p-6 shadow-sm hover:shadow-md hover:bg-card-hover transition-all focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:outline-none">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-500" aria-hidden="true">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary group-hover:text-coral-500 transition-colors">Research Library</h3>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              {safeResearchCount}+ vetted studies from NNGroup, Baymard, ACM CHI, and more.
            </p>
          </Link>
          <Link href="/ux-laws" className="group rounded-2xl border border-card-border/50 bg-card p-6 shadow-sm hover:shadow-md hover:bg-card-hover transition-all focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:outline-none">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-500" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary group-hover:text-coral-500 transition-colors">UX Laws</h3>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              {safeLawsCount} cognitive principles governing human-interface interaction.
            </p>
          </Link>
          <Link href="/myths" className="group rounded-2xl border border-card-border/50 bg-card p-6 shadow-sm hover:shadow-md hover:bg-card-hover transition-all focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:outline-none">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-500" aria-hidden="true">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary group-hover:text-coral-500 transition-colors">Debunked Myths</h3>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              {safeMythsCount} common UX assumptions the evidence doesn&apos;t support.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
