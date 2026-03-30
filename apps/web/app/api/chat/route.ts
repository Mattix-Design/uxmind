import { createServerClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "do", "does", "did", "have", "has", "had", "will", "would", "could",
  "should", "may", "might", "can", "shall", "to", "of", "in", "for",
  "on", "with", "at", "by", "from", "as", "into", "about", "between",
  "through", "after", "before", "during", "without", "within",
  "and", "or", "but", "not", "no", "nor", "so", "yet",
  "it", "its", "this", "that", "these", "those", "i", "me", "my",
  "we", "our", "you", "your", "he", "she", "they", "them", "their",
  "what", "which", "who", "whom", "how", "when", "where", "why",
  "if", "then", "than", "very", "just", "also", "more", "most",
  "some", "any", "all", "each", "every", "both", "few", "many",
  "much", "such", "own", "same", "other", "another",
  "tell", "say", "said", "know", "think", "make", "get", "give",
  "go", "come", "take", "see", "look", "find", "use", "help",
  "does", "hurt", "affect", "impact", "improve", "work", "really",
]);

function sanitizeQuery(q: string): string {
  return q.replace(/[.,()]/g, " ").trim();
}

function extractKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

async function getRelevantContext(query: string) {
  const supabase = createServerClient();
  const sanitized = sanitizeQuery(query);
  const keywords = extractKeywords(sanitized);
  const selectCols = "id, title, slug, attributed_summary, source_name, source_url, key_findings, research_type, tags, quality_score, impact_score";

  // Strategy 1: OR-based full-text search (broad recall)
  let entries: any[] = [];
  if (keywords.length > 0) {
    const ftsQuery = keywords.join(" | ");
    const { data } = await supabase
      .from("research_entries")
      .select(selectCols)
      .eq("status", "published")
      .textSearch("search_vector", ftsQuery, { type: "plain" })
      .limit(10);
    entries = data ?? [];
  }

  // Strategy 2: ilike fallback on title + summary if FTS found < 3 results
  if (entries.length < 3 && keywords.length > 0) {
    const orClauses = keywords
      .slice(0, 4)
      .flatMap((k) => [`title.ilike.%${k}%`, `attributed_summary.ilike.%${k}%`])
      .join(",");
    const { data: fallback } = await supabase
      .from("research_entries")
      .select(selectCols)
      .eq("status", "published")
      .or(orClauses)
      .limit(10);
    const existingIds = new Set(entries.map((e) => e.id));
    for (const f of fallback ?? []) {
      if (!existingIds.has(f.id)) entries.push(f);
    }
  }

  // Strategy 3: tag overlap
  if (entries.length < 5 && keywords.length > 0) {
    const { data: tagMatches } = await supabase
      .from("research_entries")
      .select(selectCols)
      .eq("status", "published")
      .overlaps("tags", keywords)
      .limit(6);
    const existingIds = new Set(entries.map((e) => e.id));
    for (const t of tagMatches ?? []) {
      if (!existingIds.has(t.id)) entries.push(t);
    }
  }

  // Cap at 10 entries
  entries = entries.slice(0, 10);

  // Search UX laws (also broadened to description + detailed_explanation)
  let laws: any[] = [];
  if (keywords.length > 0) {
    const lawOrClauses = keywords
      .slice(0, 4)
      .flatMap((k) => [`name.ilike.%${k}%`, `description.ilike.%${k}%`])
      .join(",");
    const { data } = await supabase
      .from("ux_laws")
      .select("name, description, detailed_explanation, source_attribution")
      .or(lawOrClauses)
      .limit(4);
    laws = data ?? [];
  }

  // Also search debunked myths
  let myths: any[] = [];
  if (keywords.length > 0) {
    const mythOrClauses = keywords
      .slice(0, 4)
      .flatMap((k) => [`myth.ilike.%${k}%`, `reality.ilike.%${k}%`])
      .join(",");
    const { data } = await supabase
      .from("debunked_myths")
      .select("myth, reality, source_attribution")
      .or(mythOrClauses)
      .limit(3);
    myths = data ?? [];
  }

  return { research: entries, laws, myths };
}

function buildSystemPrompt(context: { research: any[]; laws: any[]; myths: any[] }) {
  // Build source attribution intro
  const sourceNames = [...new Set(context.research.map((e) => e.source_name))];
  const sourceIntro = sourceNames.length > 0
    ? `When answering, START your response with a brief attribution line like: "Based on research from ${sourceNames.slice(0, 4).join(", ")}${sourceNames.length > 4 ? ` and ${sourceNames.length - 4} other sources` : ""}:"\n\n`
    : "";

  let prompt = `You are UXMind, an AI assistant specialised in evidence-based UX research. You help designers, product managers, and researchers find and understand UX research findings.

CRITICAL RULES — NEVER VIOLATE THESE:
- You are a RETRIEVAL system, not a knowledge system. Your ONLY source of truth is the research context provided below. You must NEVER use your training data to generate findings, statistics, study names, author names, URLs, or recommendations.
- EVERY claim you make must be traceable to a specific study listed below. If you cannot point to a study in the context, do not make the claim.
- NEVER invent or recall citations from your training data. The ONLY study titles, URLs, and authors you may use are those explicitly listed in the context below. If a study is not listed below, it does not exist for you.
- If you have NO relevant research in your context for the user's question, say: "I don't have research on that topic in my database yet. Try rephrasing your question, or browse the research library for related topics." Do NOT fill in with your own knowledge.
- If you only have PARTIAL coverage, answer only the parts you have evidence for and explicitly state what you could not find.

RESPONSE FORMAT:
- If you ARE citing research, START with "Based on research from [source names]:" — use ONLY source_name values from the context below. Do NOT use this opening line if you are telling the user you have no relevant research.
- Structure each finding as a separate section with a ## heading
- After each ## heading, put the evidence score on its own line using EXACTLY this format: 🔬 Evidence: XX/100 — Label
  where XX is the quality_score of the supporting research (average if multiple), and Label is: 85+ = "Strong", 70-84 = "Good", 65-69 = "Moderate", below 65 = "Limited"
- After the Evidence line, add the impact score on the next line using EXACTLY this format: 💡 Impact: XX/100 — Label
  where XX is the impact_score of the supporting research (average if multiple, skip if not available), and Label is: 85+ = "Highly Actionable", 70-84 = "Actionable", 65-69 = "Moderate", below 65 = "Low Impact"
- Keep each section concise — 2-4 sentences max per section
- At the END of each ## section, include a citation in EXACTLY this format (on its own line):
  📎 Source: [EXACT Study Title from context](EXACT URL from context) — Author Name(s), Year
  Copy the study title and URL EXACTLY as they appear in the context below. Do NOT paraphrase titles or construct URLs.
- At the very END of your entire response, output a special marker line: ---FOLLOWUPS--- followed by exactly 2-3 related follow-up questions the user might want to ask, one per line. Do NOT include any other text after the follow-up questions.

`;

  if (context.research.length > 0) {
    prompt += "RELEVANT RESEARCH FROM THE UXMIND DATABASE:\n\n";
    for (const entry of context.research) {
      prompt += `**${entry.title}** (${entry.source_name}) — Evidence Score: ${entry.quality_score}/100`;
      if (entry.impact_score != null) prompt += ` — Impact Score: ${entry.impact_score}/100`;
      prompt += `\n`;
      prompt += `URL: ${entry.source_url}\n`;
      prompt += `Summary: ${entry.attributed_summary}\n`;
      if (entry.key_findings?.length > 0) {
        prompt += `Key findings:\n${entry.key_findings.map((f: string) => `- ${f}`).join("\n")}\n`;
      }
      prompt += "\n";
    }
  }

  if (context.laws.length > 0) {
    prompt += "RELEVANT UX LAWS:\n\n";
    for (const law of context.laws) {
      prompt += `**${law.name}**: ${law.description}\n`;
      if (law.detailed_explanation) prompt += `${law.detailed_explanation}\n`;
      if (law.source_attribution) prompt += `Source: ${law.source_attribution}\n`;
      prompt += "\n";
    }
  }

  if (context.myths.length > 0) {
    prompt += "RELEVANT DEBUNKED UX MYTHS (from the UXMind database — these do NOT have individual quality scores or URLs, so do NOT assign a score or citation link when referencing them. Simply state the myth and reality.):\n\n";
    for (const myth of context.myths) {
      prompt += `Myth: "${myth.myth}"\n`;
      prompt += `Reality: ${myth.reality}\n`;
      prompt += "\n";
    }
  }

  prompt += `\nREMINDER: You may ONLY cite studies listed above. The study titles and URLs above are your ONLY allowed citations. Do NOT cite any study not listed above, even if you know it exists. Do NOT invent URLs.\n`;

  return prompt;
}

function computeConfidence(context: { research: any[]; laws: any[]; myths: any[] }) {
  const sourceCount = context.research.length;
  const scores = context.research
    .map((e) => e.quality_score)
    .filter((s: number | null) => s != null) as number[];
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const label = avgScore >= 85 ? "Strong" : avgScore >= 70 ? "Good" : avgScore >= 65 ? "Moderate" : "Limited";

  const impactScores = context.research
    .map((e) => e.impact_score)
    .filter((s: number | null) => s != null) as number[];
  const avgImpactScore = impactScores.length > 0 ? Math.round(impactScores.reduce((a, b) => a + b, 0) / impactScores.length) : undefined;
  const impactLabel = avgImpactScore != null
    ? avgImpactScore >= 85 ? "Highly Actionable" : avgImpactScore >= 70 ? "Actionable" : avgImpactScore >= 65 ? "Moderate" : "Low Impact"
    : undefined;

  return {
    avgScore,
    label,
    sourceCount,
    avgImpactScore,
    impactLabel,
    sources: context.research.map((e) => ({ title: e.title, score: e.quality_score, impact_score: e.impact_score ?? null, slug: e.slug })),
  };
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }
  const { messages } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Messages required" }), { status: 400 });
  }

  // Get the latest user message for context search
  const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
  const query = lastUserMessage?.content || "";

  // Retrieve relevant context from the database
  const context = await getRelevantContext(query);
  const systemPrompt = buildSystemPrompt(context);
  const confidence = computeConfidence(context);

  // Stream the response with retry for transient errors
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const stream = await anthropic.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            messages: messages.map((m: any) => ({
              role: m.role,
              content: m.content,
            })),
          });

          let fullResponse = "";
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              fullResponse += event.delta.text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }

          // Only send confidence metadata if the AI actually used the sources.
          // If the response indicates no relevant research was found, omit sources.
          // Only include sources the AI actually cited in its response.
          // A source counts as cited if the AI used its title in a markdown link
          // or referenced a substantial portion of the title verbatim.
          const responseLower = fullResponse.toLowerCase();
          const citedSources = confidence.sources.filter((s) => {
            const titleLower = s.title.toLowerCase();
            // Direct title match (full or near-full title appears in response)
            if (responseLower.includes(titleLower)) return true;
            // Markdown link match: [Title](url) — check if title appears in a link
            const escapedTitle = titleLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            if (new RegExp(`\\[${escapedTitle}\\]`, "i").test(fullResponse)) return true;
            // Check for a long consecutive substring match (at least 40 chars or 80% of title)
            const minLen = Math.min(40, Math.ceil(titleLower.length * 0.8));
            if (titleLower.length >= minLen) {
              // Sliding window: check if any substring of minLen chars from the title appears
              for (let i = 0; i <= titleLower.length - minLen; i++) {
                if (responseLower.includes(titleLower.slice(i, i + minLen))) return true;
              }
            }
            return false;
          });

          if (citedSources.length > 0) {
            const citedScores = citedSources
              .map((s) => s.score)
              .filter((s: number | null) => s != null) as number[];
            const citedAvg = citedScores.length > 0
              ? Math.round(citedScores.reduce((a, b) => a + b, 0) / citedScores.length)
              : 0;
            const citedLabel = citedAvg >= 85 ? "Strong" : citedAvg >= 70 ? "Good" : citedAvg >= 65 ? "Moderate" : "Limited";
            const citedImpactScores = citedSources
              .map((s) => s.impact_score)
              .filter((s: number | null) => s != null) as number[];
            const citedAvgImpact = citedImpactScores.length > 0
              ? Math.round(citedImpactScores.reduce((a, b) => a + b, 0) / citedImpactScores.length)
              : undefined;
            const citedImpactLabel = citedAvgImpact != null
              ? citedAvgImpact >= 85 ? "Highly Actionable" : citedAvgImpact >= 70 ? "Actionable" : citedAvgImpact >= 65 ? "Moderate" : "Low Impact"
              : undefined;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                meta: {
                  avgScore: citedAvg,
                  label: citedLabel,
                  sourceCount: citedSources.length,
                  avgImpactScore: citedAvgImpact,
                  impactLabel: citedImpactLabel,
                  sources: citedSources,
                },
              })}\n\n`)
            );
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        } catch (err: any) {
          attempts++;
          const isRetryable = err?.error?.error?.type === "overloaded_error" || err?.status === 529;
          if (isRetryable && attempts < maxAttempts) {
            await new Promise((r) => setTimeout(r, 1000 * attempts));
            continue;
          }
          console.error("Chat API error:", err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: "I'm temporarily unable to respond. Please try again in a moment." })}\n\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
