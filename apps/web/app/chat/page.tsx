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
  sources: { title: string; score: number; slug: string }[];
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
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline text-coral-400 hover:text-coral-300">$1</a>'
    )
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-surface-700 px-1.5 py-0.5 text-xs text-coral-400">$1</code>'
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
      const body = (parts[i + 1] || "").trim();
      // Extract score from evidence line
      const evidenceMatch = body.match(/🔬\s*Evidence:\s*(\d+)\/100\s*[—\-]\s*(Strong|Good|Moderate|Limited)/);
      sections.push({
        heading: headingMatch[1],
        body,
        score: evidenceMatch ? parseInt(evidenceMatch[1], 10) : undefined,
        label: evidenceMatch ? evidenceMatch[2] : undefined,
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
  if (score == null) return "text-red-400";
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  if (score >= 65) return "text-orange-400";
  return "text-red-400";
}

function trafficBg(score: number | undefined): string {
  if (score == null) return "bg-red-500/10";
  if (score >= 85) return "bg-emerald-500/10";
  if (score >= 70) return "bg-amber-500/10";
  if (score >= 65) return "bg-orange-500/10";
  return "bg-red-500/10";
}

function TrafficLight({ score }: { score?: number }) {
  const color = trafficColor(score);
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <span className="text-[10px]">{"\u25CF"}</span>
      {score != null ? `${score}/100` : "N/A"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Accordion section                                                  */
/* ------------------------------------------------------------------ */

function AccordionSection({
  heading,
  body,
  score,
  isOpen,
  onToggle,
}: {
  heading: string;
  body: string;
  score?: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-surface-600/30 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 py-2.5 text-left cursor-pointer group"
      >
        <TrafficLight score={score} />
        <span className="flex-1 text-sm font-semibold text-text-primary group-hover:text-coral-400 transition-colors">
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
          className="text-sm text-text-primary leading-relaxed pl-6 [&_strong]:font-semibold [&_strong]:text-coral-400 [&_ul]:ml-1 [&_ol]:ml-1 [&_li]:text-text-secondary [&_code]:text-xs [&_a]:transition-colors"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Assistant message with accordion rendering                         */
/* ------------------------------------------------------------------ */

function AssistantMessage({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);

  // When streaming completes, mark it (keep all sections open for the user)
  useEffect(() => {
    if (!isStreaming && content && !hasCompletedOnce) {
      setHasCompletedOnce(true);
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

  // During streaming or if no sections parsed, show raw markdown
  const { intro, sections } = parseSections(content);
  const hasSections = sections.length > 0;

  if (isStreaming || !hasSections) {
    return (
      <div
        className="text-sm text-text-primary leading-relaxed [&_strong]:font-semibold [&_strong]:text-coral-400 [&_ul]:ml-1 [&_ol]:ml-1 [&_li]:text-text-secondary [&_code]:text-xs [&_a]:transition-colors"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    );
  }

  // After streaming completes, render as accordions
  return (
    <div>
      {intro && (
        <div
          className="text-sm text-text-primary leading-relaxed mb-2 [&_strong]:font-semibold [&_strong]:text-coral-400 [&_ul]:ml-1 [&_ol]:ml-1 [&_li]:text-text-secondary [&_code]:text-xs [&_a]:transition-colors"
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
            isOpen={openSections.has(i)}
            onToggle={() => toggleSection(i)}
          />
        ))}
      </div>
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
  "What is Fitts's Law?",
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
  const color = trafficColor(meta.avgScore);
  const bg = trafficBg(meta.avgScore);

  return (
    <div className="mt-2 ml-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`inline-flex items-center gap-1.5 rounded-lg ${bg} px-2.5 py-1 text-[11px] font-medium ${color} transition hover:opacity-80 cursor-pointer`}
      >
        <span className="text-[10px]">{"\u25CF"}</span>
        {meta.label} ({meta.avgScore}/100) · {meta.sourceCount}{" "}
        {meta.sourceCount === 1 ? "source" : "sources"}
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
      {expanded && meta.sources.length > 0 && (
        <div className="mt-1.5 rounded-lg border border-surface-600/50 bg-surface-800/50 p-3">
          <p className="text-[11px] text-text-muted mb-1.5">
            Based on {meta.sourceCount} studies (avg score: {meta.avgScore}/100)
          </p>
          <ul className="space-y-1">
            {meta.sources.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-[11px]">
                <span
                  className={`shrink-0 h-1.5 w-1.5 rounded-full ${
                    s.score >= 85
                      ? "bg-emerald-400"
                      : s.score >= 70
                        ? "bg-amber-400"
                        : s.score >= 65
                          ? "bg-orange-400"
                          : "bg-red-400"
                  }`}
                />
                {s.slug ? (
                  <Link
                    href={`/research/${s.slug}`}
                    className="text-text-secondary truncate hover:text-coral-400 underline underline-offset-2 transition-colors"
                  >
                    {s.title}
                  </Link>
                ) : (
                  <span className="text-text-secondary truncate">{s.title}</span>
                )}
                <span className="ml-auto shrink-0 text-text-muted">
                  {s.score}/100
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

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSentInitial = useRef(false);

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

  return (
    <div className="flex flex-1 flex-col h-full min-h-0">
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
                      className="rounded-full border border-surface-600 bg-surface-800/50 px-3.5 py-2 text-xs text-text-secondary hover:text-text-primary hover:border-coral-500/40 hover:bg-surface-700/50 transition-all duration-200 text-left cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {hasMessages && (
            <div className="space-y-4" role="log" aria-live="polite" aria-busy={isStreaming}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "user" ? (
                    /* User bubble */
                    <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-coral-500/90 px-4 py-3 text-sm text-white leading-relaxed">
                      {msg.content}
                    </div>
                  ) : (
                    /* Assistant bubble */
                    <div className="max-w-[85%]">
                      <div className="rounded-2xl rounded-bl-sm bg-surface-800 border border-surface-600/50 px-5 py-4">
                        {msg.content ? (
                          <AssistantMessage
                            content={msg.content}
                            isStreaming={isStreaming && i === lastMsgIdx}
                          />
                        ) : (
                          <TypingIndicator />
                        )}
                      </div>
                      {/* Confidence badge */}
                      {msg.meta && msg.content && (
                        <ConfidenceBadge meta={msg.meta} />
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator when streaming but last message already has content */}
              {isStreaming &&
                messages.length > 0 &&
                messages[messages.length - 1].role === "user" && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-surface-800 border border-surface-600/50 px-5 py-2">
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
      <div className="shrink-0 border-t border-surface-700/50 bg-surface-900/95 backdrop-blur-sm px-4 py-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 rounded-2xl border border-surface-600 bg-surface-800 px-4 py-3 focus-within:border-coral-500/50 transition-colors">
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
              className="rounded-xl bg-coral-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-coral-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-coral-500 cursor-pointer"
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
