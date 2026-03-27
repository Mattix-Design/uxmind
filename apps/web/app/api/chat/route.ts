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
  const selectCols = "id, title, slug, attributed_summary, source_name, source_url, key_findings, research_type, tags, quality_score";

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

RULES:
- ${sourceIntro}START every response with "Based on research from [source names]:" listing the key sources you're drawing from
- Always cite your sources with the study title and source name
- When referencing research, include the source URL so users can read the original
- Be concise and actionable — practitioners want to apply findings, not read essays
- If you don't have relevant research in your context, say so honestly
- Never make up citations or findings
- Format responses with markdown for readability
- Structure each recommendation or finding as a separate section with a ## heading
- After each ## heading, put the evidence score on its own line using EXACTLY this format: 🔬 Evidence: XX/100 — Label
  where XX is the quality_score of the supporting research (average if multiple), and Label is: 85+ = "Strong", 70-84 = "Good", 65-69 = "Moderate", below 65 = "Limited"
  If a point is based on general knowledge rather than a specific study, write: 🔬 Evidence: General knowledge
- Keep each section concise — 2-4 sentences max per section
- Do NOT say "high confidence" or "low confidence" — always use the actual score and label (Strong/Good/Moderate/Limited)

`;

  if (context.research.length > 0) {
    prompt += "RELEVANT RESEARCH FROM THE UXMIND DATABASE:\n\n";
    for (const entry of context.research) {
      prompt += `**${entry.title}** (${entry.source_name}) — Evidence Score: ${entry.quality_score}/100\n`;
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
    prompt += "RELEVANT DEBUNKED UX MYTHS:\n\n";
    for (const myth of context.myths) {
      prompt += `Myth: "${myth.myth}"\n`;
      prompt += `Reality: ${myth.reality}\n`;
      if (myth.source_attribution) prompt += `Source: ${myth.source_attribution}\n`;
      prompt += "\n";
    }
  }

  return prompt;
}

function computeConfidence(context: { research: any[]; laws: any[]; myths: any[] }) {
  const sourceCount = context.research.length;
  const scores = context.research
    .map((e) => e.quality_score)
    .filter((s: number | null) => s != null) as number[];
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const label = avgScore >= 85 ? "Strong" : avgScore >= 70 ? "Good" : avgScore >= 65 ? "Moderate" : "Limited";

  return {
    avgScore,
    label,
    sourceCount,
    sources: context.research.map((e) => ({ title: e.title, score: e.quality_score, slug: e.slug })),
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
      // Send confidence metadata first
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ meta: confidence })}\n\n`)
      );
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

          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
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
