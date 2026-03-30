"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ConfidenceMeta {
  avgScore: number;
  label: string;
  sourceCount: number;
  avgImpactScore?: number;
  impactLabel?: string;
  sources: { title: string; score: number; impact_score?: number; slug: string }[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  meta?: ConfidenceMeta;
}

interface ParsedSection {
  heading: string;
  body: string;
  score?: number;
  label?: string;
  impactScore?: number;
  impactLabel?: string;
  citation?: { title: string; url: string; authors: string };
}

/* ------------------------------------------------------------------ */
/*  Simple markdown renderer (no external lib)                         */
/* ------------------------------------------------------------------ */

function renderMarkdown(raw: string): string {
  let html = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Links
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline text-coral-500 hover:text-coral-600">$1</a>'
    )
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-surface-800 px-1.5 py-0.5 text-xs text-coral-700">$1</code>'
    );

  const lines = html.split("\n");
  const out: string[] = [];
  let inList = false;
  let listType: "ul" | "ol" | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^[-*]\s+/.test(trimmed)) {
      if (!inList) {
        out.push('<ul class="list-disc list-inside space-y-1 my-1">');
        inList = true;
        listType = "ul";
      }
      out.push(`<li>${trimmed.replace(/^[-*]\s+/, "")}</li>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (!inList) {
        out.push('<ol class="list-decimal list-inside space-y-1 my-1">');
        inList = true;
        listType = "ol";
      }
      out.push(`<li>${trimmed.replace(/^\d+\.\s+/, "")}</li>`);
      continue;
    }

    if (inList) {
      out.push(listType === "ol" ? "</ol>" : "</ul>");
      inList = false;
      listType = null;
    }

    // Skip headings in body renderer (they are handled by accordion)
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const sizes = ["text-base font-semibold", "text-sm font-semibold", "text-sm font-medium"];
      out.push(`<p class="${sizes[level - 1]} text-text-primary mt-3 mb-1">${headingMatch[2]}</p>`);
      continue;
    }

    if (trimmed === "") {
      out.push("<br/>");
    } else {
      out.push(`<span>${trimmed}</span><br/>`);
    }
  }

  if (inList) out.push(listType === "ol" ? "</ol>" : "</ul>");
  return out.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Parse citation from section body                                   */
/* ------------------------------------------------------------------ */

function parseCitation(body: string): { cleanBody: string; citation?: { title: string; url: string; authors: string } } {
  // Match properly formatted citations: 📎 Source: [Title](url) — Authors
  const citationRegex = /\n?\s*📎\s*Source:\s*\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)\s*[—\-]\s*(.+)$/m;
  const match = body.match(citationRegex);
  if (match) {
    return {
      cleanBody: body.replace(citationRegex, "").trim(),
      citation: {
        title: match[1],
        url: match[2],
        authors: match[3].trim(),
      },
    };
  }
  // Strip any malformed citation lines (📎 without proper [title](url) format) — these are hallucinated
  const malformedCitation = /\n?\s*📎\s*Source:.*$/gm;
  const cleaned = body.replace(malformedCitation, "").trim();
  return { cleanBody: cleaned };
}

/* ------------------------------------------------------------------ */
/*  Parse followups from content                                       */
/* ------------------------------------------------------------------ */

function parseFollowups(content: string): { cleanContent: string; followups: string[] } {
  const marker = "---FOLLOWUPS---";
  const idx = content.indexOf(marker);
  if (idx === -1) return { cleanContent: content, followups: [] };

  const cleanContent = content.slice(0, idx).trim();
  const followupsRaw = content.slice(idx + marker.length).trim();
  const followups = followupsRaw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  return { cleanContent, followups };
}

/* ------------------------------------------------------------------ */
/*  Parse sections from streamed markdown                              */
/* ------------------------------------------------------------------ */

function parseSections(content: string): { intro: string; sections: ParsedSection[] } {
  // Split on ## or ### headings
  const parts = content.split(/^(#{2,3}\s+.+)$/m);
  let intro = "";
  const sections: ParsedSection[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const headingMatch = part.match(/^#{2,3}\s+(.+)$/);

    if (headingMatch) {
      // Next part is the body for this heading
      const rawBody = (parts[i + 1] || "").trim();
      // Extract score from evidence line
      const evidenceMatch = rawBody.match(/🔬\s*Evidence:\s*(\d+)\/100\s*[—\-]\s*(Strong|Good|Moderate|Limited)/);
      // Extract impact score from impact line
      const impactMatch = rawBody.match(/💡\s*Impact:\s*(\d+)\/100\s*[—\-]\s*(Highly Actionable|Actionable|Moderate|Low Impact)/);
      // Strip ALL evidence and impact lines from body (any format — scored, general knowledge, or non-standard)
      const bodyWithoutEvidence = rawBody
        .replace(/🔬\s*Evidence:.*$/gm, "")
        .replace(/🧪\s*Evidence:.*$/gm, "")
        .replace(/💡\s*Impact:.*$/gm, "")
        .trim();
      // Extract citation
      const { cleanBody, citation } = parseCitation(bodyWithoutEvidence);
      sections.push({
        heading: headingMatch[1],
        body: cleanBody,
        score: evidenceMatch ? parseInt(evidenceMatch[1], 10) : undefined,
        label: evidenceMatch ? evidenceMatch[2] : undefined,
        impactScore: impactMatch ? parseInt(impactMatch[1], 10) : undefined,
        impactLabel: impactMatch ? impactMatch[2] : undefined,
        citation,
      });
      i++; // skip the body part
    } else if (sections.length === 0) {
      // Content before first heading = intro
      intro += part;
    }
  }

  return { intro: intro.trim(), sections };
}

/* ------------------------------------------------------------------ */
/*  Traffic light component                                            */
/* ------------------------------------------------------------------ */

function trafficColor(score: number | undefined): string {
  if (score == null) return "text-red-700";
  if (score >= 85) return "text-green-700";
  if (score >= 70) return "text-amber-700";
  if (score >= 65) return "text-coral-700";
  return "text-red-700";
}

function trafficBg(score: number | undefined): string {
  if (score == null) return "bg-red-50";
  if (score >= 85) return "bg-green-50";
  if (score >= 70) return "bg-amber-50";
  if (score >= 65) return "bg-coral-500/10";
  return "bg-red-50";
}

function impactColor(score: number | undefined): string {
  if (score == null) return "text-gray-400";
  if (score >= 85) return "text-green-700";
  if (score >= 70) return "text-amber-700";
  if (score >= 65) return "text-coral-700";
  return "text-red-700";
}

function impactBg(score: number | undefined): string {
  if (score == null) return "bg-gray-50";
  if (score >= 85) return "bg-green-50";
  if (score >= 70) return "bg-amber-50";
  if (score >= 65) return "bg-coral-500/10";
  return "bg-red-50";
}

function TrafficLight({ score }: { score?: number }) {
  if (score == null) return null;
  const color = trafficColor(score);
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <span className="text-[10px]">{"\u25CF"}</span>
      {`${score}/100`}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Citation block                                                     */
/* ------------------------------------------------------------------ */

function CitationBlock({ citation, knownSlugs }: { citation: { title: string; url: string; authors: string }; knownSlugs?: Set<string> }) {
  // Don't render citations without a valid, complete URL
  // Reject empty URLs, non-http, and stub URLs that end with just a path segment (e.g. /paper/)
  if (!citation.url || !citation.url.startsWith("http")) return null;
  const urlPath = new URL(citation.url).pathname;
  if (urlPath === "/" || urlPath.endsWith("/paper/") || urlPath.endsWith("/abs/")) return null;
  const slug = knownSlugs ? findSlugForUrl(citation.url, knownSlugs) : null;

  return (
    <div className="mt-2 rounded-lg border-l-2 border-coral-500/60 bg-surface-800/50 px-3 py-2">
      <div className="flex items-start gap-1.5 text-xs">
        <span className="shrink-0 mt-0.5 text-text-muted">📎</span>
        <div className="min-w-0">
          {slug ? (
            <Link
              href={`/research/${slug}`}
              className="text-coral-500 hover:text-coral-600 underline underline-offset-2 transition-colors font-medium"
            >
              {citation.title}
            </Link>
          ) : (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-coral-500 hover:text-coral-600 underline underline-offset-2 transition-colors font-medium"
            >
              {citation.title}
            </a>
          )}
          <span className="block text-text-muted mt-0.5">{citation.authors}</span>
        </div>
      </div>
    </div>
  );
}

function findSlugForUrl(url: string, knownSlugs: Set<string>): string | null {
  for (const slug of knownSlugs) {
    if (url.includes(slug)) return slug;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Accordion section                                                  */
/* ------------------------------------------------------------------ */

function AccordionSection({
  heading,
  body,
  score,
  impactScore,
  citation,
  isOpen,
  onToggle,
  knownSlugs,
  style,
}: {
  heading: string;
  body: string;
  score?: number;
  impactScore?: number;
  citation?: { title: string; url: string; authors: string };
  isOpen: boolean;
  onToggle: () => void;
  knownSlugs?: Set<string>;
  style?: React.CSSProperties;
}) {
  return (
    <div className="border-b border-card-border/50 last:border-b-0 uxm-section-fade" style={style}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 py-2.5 text-left cursor-pointer group focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:outline-none rounded"
      >
        <TrafficLight score={score} />
        {impactScore != null && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${impactColor(impactScore)}`}>
            <span className="text-[10px]">{"\u25CF"}</span>
            {`${impactScore}/100`}
          </span>
        )}
        <span className="flex-1 text-sm font-semibold text-text-primary group-hover:text-coral-500 transition-colors">
          {heading}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-[2000px] opacity-100 pb-3" : "max-h-0 opacity-0"}`}
      >
        <div
          className="text-sm text-text-primary leading-relaxed pl-6 [&_strong]:font-semibold [&_strong]:text-coral-500 [&_ul]:ml-1 [&_ol]:ml-1 [&_li]:text-text-secondary [&_code]:text-xs [&_a]:transition-colors"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
        />
        {citation && (
          <div className="pl-6">
            <CitationBlock citation={citation} knownSlugs={knownSlugs} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Streaming analysis indicator                                       */
/* ------------------------------------------------------------------ */

const ANALYSIS_STEPS = [
  "Analysing research...",
  "Searching evidence base...",
  "Found relevant sources...",
  "Cross-referencing findings...",
  "Generating insights...",
];

function AnalysisIndicator() {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const timings = [1800, 2200, 2000, 2500, 3000];
    let timeout: ReturnType<typeof setTimeout>;
    let current = 0;

    const advance = () => {
      current++;
      if (current < ANALYSIS_STEPS.length) {
        setStepIdx(current);
        timeout = setTimeout(advance, timings[current] || 2000);
      }
    };

    timeout = setTimeout(advance, timings[0]);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-col items-start gap-3 py-2">
      <div className="flex items-center gap-3">
        {/* Animated progress bar */}
        <div className="relative h-1 w-32 overflow-hidden rounded-full bg-surface-700/50">
          <div className="uxm-progress-bar absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-coral-500 to-coral-400" />
        </div>
      </div>
      <p className="text-sm text-text-secondary uxm-status-text">
        {ANALYSIS_STEPS[stepIdx]}
      </p>
      <div className="flex items-center gap-1.5">
        <span className="uxm-pulse-dot h-1.5 w-1.5 rounded-full bg-coral-400" style={{ animationDelay: "0ms" }} />
        <span className="uxm-pulse-dot h-1.5 w-1.5 rounded-full bg-coral-400" style={{ animationDelay: "200ms" }} />
        <span className="uxm-pulse-dot h-1.5 w-1.5 rounded-full bg-coral-400" style={{ animationDelay: "400ms" }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Copy & Share for assistant messages                                */
/* ------------------------------------------------------------------ */

function MessageActions({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const plainText = content
    .replace(/---FOLLOWUPS---[\s\S]*$/, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/#{1,3}\s+/g, "")
    .replace(/📎\s*Source:.*$/gm, "")
    .trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // blocked
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "UXMind Research", text: plainText });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // cancelled or blocked
    }
  };

  return (
    <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-150">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-md p-1.5 text-text-muted hover:text-text-secondary hover:bg-surface-800/80 transition cursor-pointer"
        title={copied ? "Copied!" : "Copy response"}
      >
        {copied ? (
          <svg className="h-3.5 w-3.5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="rounded-md p-1.5 text-text-muted hover:text-text-secondary hover:bg-surface-800/80 transition cursor-pointer"
        title="Share"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Assistant message with accordion rendering                         */
/* ------------------------------------------------------------------ */

function AssistantMessage({
  content,
  isStreaming,
  knownSlugs,
}: {
  content: string;
  isStreaming: boolean;
  knownSlugs?: Set<string>;
}) {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);
  const [visibleSections, setVisibleSections] = useState(0);

  // When streaming completes, trigger staggered reveal
  useEffect(() => {
    if (!isStreaming && content && !hasCompletedOnce) {
      setHasCompletedOnce(true);
      // Stagger the reveal of sections
      const { sections } = parseSections(parseFollowups(content).cleanContent);
      if (sections.length > 0) {
        let count = 0;
        const interval = setInterval(() => {
          count++;
          setVisibleSections(count);
          if (count >= sections.length) clearInterval(interval);
        }, 100);
        return () => clearInterval(interval);
      }
    }
  }, [isStreaming, content, hasCompletedOnce]);

  const toggleSection = (idx: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // While streaming, show the analysis indicator instead of raw text
  if (isStreaming) {
    return <AnalysisIndicator />;
  }

  // Parse followups out of content
  const { cleanContent } = parseFollowups(content);
  const { intro, sections } = parseSections(cleanContent);
  const hasSections = sections.length > 0;

  if (!hasSections) {
    return (
      <div
        className="text-sm text-text-primary leading-relaxed [&_strong]:font-semibold [&_strong]:text-coral-500 [&_ul]:ml-1 [&_ol]:ml-1 [&_li]:text-text-secondary [&_code]:text-xs [&_a]:transition-colors"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(cleanContent) }}
      />
    );
  }

  // After streaming completes, render as accordions with staggered fade
  return (
    <div>
      {intro && (
        <div
          className="text-sm text-text-primary leading-relaxed mb-2 [&_strong]:font-semibold [&_strong]:text-coral-500 [&_ul]:ml-1 [&_ol]:ml-1 [&_li]:text-text-secondary [&_code]:text-xs [&_a]:transition-colors uxm-section-fade"
          style={{ animationDelay: "0ms" }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(intro) }}
        />
      )}
      <div className="mt-1">
        {sections.map((sec, i) => (
          <AccordionSection
            key={i}
            heading={sec.heading}
            body={sec.body}
            score={sec.score}
            impactScore={sec.impactScore}
            citation={sec.citation}
            isOpen={openSections.has(i)}
            onToggle={() => toggleSection(i)}
            knownSlugs={knownSlugs}
            style={{
              animationDelay: `${(i + 1) * 100}ms`,
              opacity: i < visibleSections ? undefined : 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Follow-up suggestion chips                                         */
/* ------------------------------------------------------------------ */

function FollowupChips({
  followups,
  onSelect,
}: {
  followups: string[];
  onSelect: (q: string) => void;
}) {
  if (followups.length === 0) return null;

  return (
    <div className="mt-2 ml-1 flex flex-wrap gap-1.5 uxm-section-fade" style={{ animationDelay: "300ms" }}>
      {followups.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="rounded-full border border-card-border bg-card px-3.5 py-2.5 min-h-[44px] text-[11px] text-text-secondary hover:text-text-primary hover:shadow-sm transition-all duration-200 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:outline-none"
        >
          {q}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Suggestion chips                                                   */
/* ------------------------------------------------------------------ */

const SUGGESTIONS = [
  "What does research say about checkout UX?",
  "How fast do users form first impressions?",
  "Best practices for mobile form design",
  "What is Fitts\u2019s Law?",
  "Does infinite scroll hurt usability?",
  "How do colour choices affect trust?",
  "What are the most common checkout mistakes?",
  "Explain Hick\u2019s Law with examples",
];

/* ------------------------------------------------------------------ */
/*  Typing indicator                                                   */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3" aria-hidden="true">
      <span className="h-2 w-2 rounded-full bg-text-muted animate-bounce [animation-delay:0ms]" />
      <span className="h-2 w-2 rounded-full bg-text-muted animate-bounce [animation-delay:150ms]" />
      <span className="h-2 w-2 rounded-full bg-text-muted animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Confidence badge                                                   */
/* ------------------------------------------------------------------ */

function ConfidenceBadge({ meta }: { meta: ConfidenceMeta }) {
  const [expanded, setExpanded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const color = trafficColor(meta.avgScore);
  const bg = trafficBg(meta.avgScore);

  const scoreGuidance = meta.avgScore >= 85
    ? "Strong evidence — high-quality research with rigorous methodology. Findings are reliable enough to inform design decisions with confidence."
    : meta.avgScore >= 70
      ? "Good evidence — solid research methodology. Findings are worth incorporating into your design process, but consider your specific context."
      : "Moderate evidence — the research provides useful direction, but methodology has some limitations. Treat as informed guidance rather than definitive proof.";

  const impactGuidance = meta.avgImpactScore != null
    ? meta.avgImpactScore >= 85
      ? "Highly actionable — clear, directly implementable design recommendations backed by strong effect sizes."
      : meta.avgImpactScore >= 70
        ? "Actionable — solid design recommendations with meaningful real-world validation."
        : "Moderate impact — useful direction, but may need adaptation for your specific use case."
    : null;

  return (
    <div className="ml-0">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`inline-flex items-center gap-1.5 rounded-lg ${bg} px-2.5 py-1 text-[11px] font-medium ${color} transition hover:opacity-80 cursor-pointer`}
        >
          <span className="text-[10px]">{"\u25CF"}</span>
          Evidence: {meta.avgScore}/100
          {meta.avgImpactScore != null && (
            <span className={`${impactColor(meta.avgImpactScore)}`}>
              · Impact: {meta.avgImpactScore}/100
            </span>
          )}
          <span>· {meta.sourceCount}{" "}{meta.sourceCount === 1 ? "source" : "sources"}</span>
          <svg
            className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="relative">
          <button
            onClick={() => setShowInfo(!showInfo)}
            onKeyDown={(e) => { if (e.key === "Escape") setShowInfo(false); }}
            aria-expanded={showInfo}
            aria-describedby={showInfo ? "score-info-tooltip" : undefined}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] text-text-muted hover:text-text-secondary transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:outline-none rounded"
            aria-label="What does this score mean?"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </button>
          {showInfo && (
            <div id="score-info-tooltip" role="tooltip" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-lg border border-card-border bg-card p-3 shadow-lg z-10">
              <p className="text-[11px] font-medium text-text-primary mb-1.5">
                What does this score mean?
              </p>
              <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
                The <span className="font-medium">evidence score</span> rates the quality of the underlying research — methodology, sample size, peer review, and replicability.
              </p>
              <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
                {scoreGuidance}
              </p>
              {meta.avgImpactScore != null && (
                <>
                  <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
                    The <span className="font-medium">impact score</span> rates how actionable the findings are — effect size, clarity of design recommendations, and real-world validation. Higher scores mean more directly implementable insights.
                  </p>
                  {impactGuidance && (
                    <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
                      {impactGuidance}
                    </p>
                  )}
                </>
              )}
              <div className="flex flex-col gap-1 text-[10px] text-text-muted border-t border-card-border/50 pt-2 mt-1">
                <p className="font-medium text-text-secondary mb-0.5">Evidence</p>
                <span><span className="font-medium text-green-700">85+</span> Strong — highly rigorous, act with confidence</span>
                <span><span className="font-medium text-amber-700">70–84</span> Good — solid evidence, worth implementing</span>
                <span><span className="font-medium text-coral-700">65–69</span> Moderate — useful guidance, verify for your context</span>
              </div>
              {meta.avgImpactScore != null && (
                <div className="flex flex-col gap-1 text-[10px] text-text-muted pt-1.5 mt-1">
                  <p className="font-medium text-text-secondary mb-0.5">Impact</p>
                  <span><span className="font-medium text-green-700">85+</span> Highly Actionable — directly implementable</span>
                  <span><span className="font-medium text-amber-700">70–84</span> Actionable — solid recommendations</span>
                  <span><span className="font-medium text-coral-700">65–69</span> Moderate — useful, adapt for context</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {expanded && meta.sources.length > 0 && (
        <div className="mt-1.5 rounded-lg border border-card-border bg-card p-3 shadow-sm">
          <p className="text-[11px] text-text-muted mb-1.5">
            Based on {meta.sourceCount} {meta.sourceCount === 1 ? "study" : "studies"} (avg evidence: {meta.avgScore}/100{meta.avgImpactScore != null ? ` · avg impact: ${meta.avgImpactScore}/100` : ""})
          </p>
          <ul className="space-y-1">
            {meta.sources.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-[11px]">
                <span
                  className={`shrink-0 h-1.5 w-1.5 rounded-full ${
                    s.score >= 85
                      ? "bg-green-700"
                      : s.score >= 70
                        ? "bg-amber-700"
                        : s.score >= 65
                          ? "bg-coral-600"
                          : "bg-red-700"
                  }`}
                />
                {s.slug ? (
                  <Link
                    href={`/research/${s.slug}`}
                    className="text-text-secondary truncate hover:text-coral-500 underline underline-offset-2 transition-colors"
                  >
                    {s.title}
                  </Link>
                ) : (
                  <span className="text-text-secondary truncate">{s.title}</span>
                )}
                <span className="ml-auto shrink-0 text-text-muted whitespace-nowrap">
                  {s.score}/100
                  {s.impact_score != null && (
                    <span className={`ml-1.5 ${impactColor(s.impact_score)}`}>
                      · {s.impact_score}/100
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chat inner (needs useSearchParams => wrapped in Suspense)          */
/* ------------------------------------------------------------------ */

function ChatInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = sessionStorage.getItem("uxmind-chat");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showHistoryCta, setShowHistoryCta] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSentInitial = useRef(false);

  /* Persist messages to sessionStorage */
  useEffect(() => {
    try {
      sessionStorage.setItem("uxmind-chat", JSON.stringify(messages));
    } catch { /* quota exceeded — ignore */ }
  }, [messages]);

  // Collect known slugs from confidence metadata for citation linking
  const knownSlugs = new Set<string>();
  for (const msg of messages) {
    if (msg.meta?.sources) {
      for (const s of msg.meta.sources) {
        if (s.slug) knownSlugs.add(s.slug);
      }
    }
  }

  /* Auto-scroll to bottom when messages change */
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  /* Send a message and stream the response */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: Message = { role: "user", content: text.trim() };
      const updatedMessages = [...messages, userMsg];

      setMessages(updatedMessages);
      setInput("");
      setIsStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let assistantContent = "";
        let responseMeta: ConfidenceMeta | undefined;

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const payload = trimmed.slice(6);
            if (payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload);
              if (parsed.meta) {
                responseMeta = parsed.meta;
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = {
                    ...next[next.length - 1],
                    meta: parsed.meta,
                  };
                  return next;
                });
              }
              if (parsed.text) {
                assistantContent += parsed.text;
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                    meta: responseMeta,
                  };
                  return next;
                });
              }
            } catch {
              // skip unparseable lines
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim().startsWith("data: ")) {
          const payload = buffer.trim().slice(6);
          if (payload !== "[DONE]") {
            try {
              const parsed = JSON.parse(payload);
              if (parsed.text) {
                assistantContent += parsed.text;
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                    meta: responseMeta,
                  };
                  return next;
                });
              }
            } catch {
              // skip
            }
          }
        }
      } catch (err) {
        console.error("Chat error:", err);
        setMessages((prev) => {
          const next = [...prev];
          if (next.length > 0 && next[next.length - 1].role === "assistant") {
            next[next.length - 1] = { role: "assistant", content: "Sorry, something went wrong. Please try again in a moment." };
          } else {
            next.push({ role: "assistant", content: "Sorry, something went wrong. Please try again in a moment." });
          }
          return next;
        });
      } finally {
        setIsStreaming(false);
        inputRef.current?.focus();
      }
    },
    [messages, isStreaming]
  );

  /* Auto-send initial query from ?q= param */
  useEffect(() => {
    if (initialQuery && !hasSentInitial.current) {
      hasSentInitial.current = true;
      router.replace("/chat", { scroll: false });
      sendMessage(initialQuery);
    }
  }, [initialQuery, sendMessage, router]);

  /* Focus input on mount */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleChipClick = (q: string) => {
    sendMessage(q);
  };

  const hasMessages = messages.length > 0;

  // Check if the last message is the one currently streaming
  const lastMsgIdx = messages.length - 1;

  const handleNewChat = () => {
    setMessages([]);
    sessionStorage.removeItem("uxmind-chat");
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-1 flex-col h-full min-h-0">
      {/* New chat button */}
      {hasMessages && !isStreaming && (
        <div className="shrink-0 flex justify-end px-4 sm:px-6 pt-3">
          <button
            onClick={handleNewChat}
            className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:shadow-sm transition-all cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New chat
          </button>
        </div>
      )}
      {/* Scrollable message area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6">
        <div className="mx-auto w-full max-w-3xl py-8">
          {/* Welcome state with suggestions */}
          {!hasMessages && !isStreaming && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-semibold text-text-primary mb-2">
                  UXMind Chat
                </h1>
                <p className="text-sm text-text-secondary max-w-md">
                  Your AI research assistant — backed by 100+ vetted UX studies
                  and 18 cognitive laws. Ask anything about UX design, usability,
                  or research findings.
                </p>
              </div>

              <div className="w-full max-w-lg">
                <p className="text-xs text-text-muted mb-3 text-center">
                  Try asking about:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleChipClick(q)}
                      className="rounded-full border border-card-border bg-card px-3.5 py-2.5 min-h-[44px] text-xs text-text-secondary hover:text-text-primary hover:shadow-sm transition-all duration-200 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:outline-none"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Persistent heading for screen readers */}
          {hasMessages && <h1 className="sr-only">UXMind Chat</h1>}

          {/* Messages */}
          {hasMessages && (
            <div className="space-y-4" role="log" aria-live="polite" aria-busy={isStreaming}>
              {messages.map((msg, i) => {
                const isMsgStreaming = isStreaming && i === lastMsgIdx;
                const followups = !isMsgStreaming && msg.role === "assistant" && msg.content
                  ? parseFollowups(msg.content).followups
                  : [];

                return (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                    aria-label={msg.role === "user" ? "Your message" : "UXMind response"}
                  >
                    {msg.role === "user" ? (
                      /* User bubble */
                      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-coral-500 px-4 py-3 text-sm text-white leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      /* Assistant bubble */
                      <div className="max-w-[85%]">
                        <div className="relative rounded-2xl rounded-bl-sm bg-card border border-card-border shadow-sm px-5 py-4 group/msg">
                          {/* Copy/Share actions */}
                          {msg.content && !isMsgStreaming && (
                            <MessageActions content={msg.content} />
                          )}
                          {msg.content ? (
                            <AssistantMessage
                              content={msg.content}
                              isStreaming={isMsgStreaming}
                              knownSlugs={knownSlugs}
                            />
                          ) : (
                            <TypingIndicator />
                          )}
                          {/* Confidence badge — inside the bubble */}
                          {msg.meta && msg.content && !isMsgStreaming && (
                            <div className="mt-3 pt-3 border-t border-card-border/50">
                              <ConfidenceBadge meta={msg.meta} />
                            </div>
                          )}
                        </div>
                        {/* Follow-up chips */}
                        {followups.length > 0 && i === lastMsgIdx && (
                          <FollowupChips followups={followups} onSelect={handleChipClick} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator when streaming but last message already has content */}
              {isStreaming &&
                messages.length > 0 &&
                messages[messages.length - 1].role === "user" && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-card border border-card-border shadow-sm px-5 py-2">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} className="h-1" />
        </div>
      </div>

      {/* Sticky input bar */}
      <div className="shrink-0 border-t border-surface-700/50 bg-card/95 backdrop-blur-sm px-4 py-4">
        {/* History CTA */}
        {hasMessages && showHistoryCta && (
          <div className="mx-auto max-w-3xl mb-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-coral-200 bg-coral-50 px-4 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="h-4 w-4 shrink-0 text-coral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-text-secondary truncate">
                  <span className="font-medium text-text-primary">Save your chat history.</span>{" "}
                  Sign up to keep conversations and pick up where you left off.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/signup"
                  className="rounded-lg bg-coral-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-coral-600 transition-colors"
                >
                  Sign up free
                </Link>
                <button
                  onClick={() => setShowHistoryCta(false)}
                  className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                  aria-label="Dismiss"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 rounded-2xl border border-card-border bg-card px-4 py-3 shadow-sm focus-within:border-coral-500/50 focus-within:shadow-md transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isStreaming
                  ? "Waiting for response..."
                  : "Ask about UX research..."
              }
              disabled={isStreaming}
              aria-label="Ask about UX research"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="rounded-xl bg-coral-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-coral-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-coral-500 cursor-pointer"
            >
              {isStreaming ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              ) : (
                "Send"
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-text-muted">
            Responses are AI-generated from curated UX research. Always verify
            critical decisions.
          </p>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page export (Suspense boundary for useSearchParams)                */
/* ------------------------------------------------------------------ */

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-coral-500 border-t-transparent" />
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  );
}
