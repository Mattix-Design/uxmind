import { createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const context = searchParams.get("context") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const supabase = createServerClient();
  let query = supabase
    .from("research_entries")
    .select("id, title, slug, attributed_summary, source_name, research_type, site_contexts, tags, authors, publication_date")
    .eq("status", "published")
    .order("publication_date", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq("research_type", type);
  }

  if (context) {
    query = query.contains("site_contexts", [context]);
  }

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entries: data, count });
}
