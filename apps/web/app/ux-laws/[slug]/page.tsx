import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerClient();

  const { data: law } = await supabase
    .from("ux_laws")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!law) return { title: "UX Law not found" };

  return {
    title: `${law.name} — UXMind.ai`,
    description: law.description ?? `Learn about ${law.name} and its impact on UX design.`,
  };
}

export default async function UxLawDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServerClient();

  const { data: law } = await supabase
    .from("ux_laws")
    .select("name, slug, description, detailed_explanation, examples, source_attribution, category")
    .eq("slug", slug)
    .single();

  if (!law) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-text-muted">
        <Link href="/ux-laws" className="transition-colors hover:text-coral-500">
          UX Laws
        </Link>
        <span>/</span>
        <span className="text-text-secondary">{law.name}</span>
      </nav>

      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-text-primary">
        {law.name}
      </h1>

      <p className="mt-4 text-lg leading-relaxed text-text-secondary">{law.description}</p>

      {/* Summary cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Examples count */}
        <div className="rounded-xl border border-card-border/50 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-muted">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 9h6M9 13h6M9 17h4" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wide">Examples</span>
          </div>
          <p className="mt-2 text-lg font-bold text-text-primary">
            {law.examples?.length ?? 0} {(law.examples?.length ?? 0) === 1 ? "example" : "examples"}
          </p>
        </div>

        {/* Source */}
        <div className="rounded-xl border border-card-border/50 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-muted">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wide">Source</span>
          </div>
          <p className="mt-2 text-sm font-medium text-text-primary truncate" title={law.source_attribution ?? undefined}>
            {law.source_attribution
              ? law.source_attribution.length > 60
                ? `${law.source_attribution.slice(0, 60)}...`
                : law.source_attribution
              : "Not attributed"}
          </p>
        </div>

        {/* Category */}
        <div className="rounded-xl border border-card-border/50 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-muted">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wide">Category</span>
          </div>
          <p className="mt-2 text-lg font-bold capitalize text-text-primary">
            {law.category ? law.category.replace(/_/g, " ") : "Uncategorised"}
          </p>
        </div>
      </div>

      {law.detailed_explanation && (
        <div className="mt-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">In Detail</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-text-secondary">
            {law.detailed_explanation}
          </p>
        </div>
      )}

      {law.source_attribution && (
        <div className="mt-10 rounded-xl border-l-2 border-coral-500 bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-coral-600">Source</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {law.source_attribution}
          </p>
        </div>
      )}

      {law.examples && law.examples.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Examples</h2>
          <ul className="mt-4 space-y-3">
            {law.examples.map((ex: { title: string; description: string }, i: number) => (
              <li
                key={i}
                className="rounded-lg border border-card-border/50 bg-card p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coral-500/20 text-xs font-semibold text-coral-600">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{ex.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">{ex.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-14">
        <Link
          href="/ux-laws"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-coral-500 transition-colors hover:text-coral-600"
        >
          &larr; Back to UX Laws
        </Link>
      </div>
    </div>
  );
}
