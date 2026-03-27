export interface ChatSession {
  id: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  cited_research_ids: string[];
  created_at: string;
}
