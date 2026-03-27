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
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary text-center mb-10">
          Why UXMind
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-500" aria-hidden="true">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              ),
              title: "Vetted, not vibes.",
              body: "Every finding traces back to published research — NNGroup, Baymard, ACM CHI, peer-reviewed journals. No Medium hot takes.",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-500" aria-hidden="true">
                  <path d="M3 3v18h18" />
                  <path d="M7 16l4-8 4 4 4-8" />
                </svg>
              ),
              title: "Scored for reliability.",
              body: "Our Evidence Score rates each study on methodology, sample size, recency, and replicability. You see exactly how strong the proof is.",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-500" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ),
              title: "Always current.",
              body: "The knowledge base is continuously updated. Studies are re-scored as new research emerges or findings are superseded.",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral-500" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              ),
              title: "Built for practitioners.",
              body: "Ask a question in plain language. Get a synthesized answer with citations, not a wall of abstracts.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-card-border/50 bg-card p-6 shadow-sm hover:shadow-md hover:bg-card-hover transition-all"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500/10">
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold text-text-primary">{card.title}</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Evidence Score explainer */}
      <section className="mx-auto max-w-4xl w-full px-4 py-16 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary text-center">
          Not all research is created equal.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-text-secondary text-center max-w-2xl mx-auto">
          Every study in UXMind carries an Evidence Score from 0 to 100. It&apos;s calculated
          from four factors: methodological rigour, sample size and diversity, recency of the
          research, and source authority. A score of 85+ means you can cite it with confidence.
          Below 65, treat it as directional, not definitive.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-700" />
            Strong (85+)
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-700" />
            Good (70-84)
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-coral-500/20 bg-coral-500/10 px-4 py-2 text-sm font-semibold text-coral-600">
            <span className="h-2 w-2 rounded-full bg-coral-600" />
            Moderate (65-69)
          </span>
        </div>
      </section>

      {/* Browse cards */}
      <section className="mx-auto max-w-6xl w-full px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <Link href="/research" className="group rounded-2xl border border-card-border/50 bg-card p-6 shadow-sm hover:shadow-md hover:bg-card-hover transition-all">
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
          <Link href="/ux-laws" className="group rounded-2xl border border-card-border/50 bg-card p-6 shadow-sm hover:shadow-md hover:bg-card-hover transition-all">
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
          <Link href="/myths" className="group rounded-2xl border border-card-border/50 bg-card p-6 shadow-sm hover:shadow-md hover:bg-card-hover transition-all">
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
